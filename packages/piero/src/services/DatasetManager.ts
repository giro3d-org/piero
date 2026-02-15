import type Instance from '@giro3d/giro3d/core/Instance';
import type Layer from '@giro3d/giro3d/core/layer/Layer';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type Giro3DMap from '@giro3d/giro3d/entities/Map';

import Extent from '@giro3d/giro3d/core/geographic/Extent';
import MaskLayer, { MaskMode } from '@giro3d/giro3d/core/layer/MaskLayer';
import AxisGrid from '@giro3d/giro3d/entities/AxisGrid';
import { isMap } from '@giro3d/giro3d/entities/Map';
import Giro3dVectorSource from '@giro3d/giro3d/sources/VectorSource';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { Fill, Style } from 'ol/style';
import { Color, Vector3 } from 'three';

import type { Dataset } from '@/types/Dataset';

import { Notification } from '@/api/notifications';
import { getConfig } from '@/configurationLoader';
import { GLOBAL_EVENT_DISPATCHER } from '@/events';
import DatasetBuilder from '@/giro3d/DatasetBuilder';
import loader from '@/loaders/loader';
import { useDatasetStore } from '@/stores/datasets';
import { useNotificationStore } from '@/stores/notifications';
import { Datagroup, type DatasetOrGroup, DatasetState } from '@/types/Dataset';

import type LayerManager from './LayerManager';

export default class DatasetManager {
    private readonly _axisGrids: Map<string, AxisGrid> = new Map();
    private readonly _entities: Map<string, Entity3D[]> = new Map();
    private readonly _instance: Instance;
    private readonly _layerManager: LayerManager;
    private readonly _layers: Map<string, Layer[]> = new Map();
    private readonly _masks: Map<string, MaskLayer> = new Map();
    private readonly _notifications = useNotificationStore();
    private readonly _store = useDatasetStore();

    public constructor(instance: Instance, layerManager: LayerManager) {
        this._instance = instance;
        this._layerManager = layerManager;

        this._store.$onAction(({ after, args, name }) => {
            after(() => {
                switch (name) {
                    case 'importFromFile':
                        void this.importFromFile(args[0]);
                        break;
                    case 'remove':
                        this.deleteDataset(args[0]);
                        break;
                    case 'setOpacity':
                        void this.onOpacityChanged(args[0], args[1]);
                        break;
                    case 'setVisible':
                        void this.onVisibilityChanged(args[0], args[1]);
                        break;
                    case 'toggleGrid':
                        void this.onToggleGrid(args[0]);
                        break;
                    case 'toggleMask':
                        void this.onToggleMask(args[0]);
                        break;
                }
            });
        });

        for (const dataset of this._store.getDatasets()) {
            if (dataset.visibleSelf) {
                void this.preloadDataset(dataset);
            }
        }
    }

    public dispose(): void {
        // Nothing to do (?)
    }

    private async buildDatasetObjects(dataset: Dataset): Promise<void> {
        const buildResult = await DatasetBuilder.build(this._instance, dataset);

        const zOrder = dataset.zOrder;

        if (buildResult.entities && buildResult.entities.length > 0) {
            for (const entity of buildResult.entities) {
                await this._instance.add(entity);
                entity.visible = dataset.visibleSelf;
            }
            this._entities.set(dataset.uuid, buildResult.entities);
            this._store.attachEntities(dataset, buildResult.entities);
        }

        if (buildResult.layers && buildResult.layers.length > 0) {
            for (const layer of buildResult.layers) {
                await this._layerManager.addLayer(layer, zOrder);
                layer.visible = dataset.visibleSelf;
            }
            this._layers.set(dataset.uuid, buildResult.layers);
            this._store.attachLayers(dataset, buildResult.layers);
        }
    }

    private async createGrid(dataset: DatasetOrGroup): Promise<void> {
        const box = this._store.getBoundingBox(dataset);
        if (box == null || box.isEmpty()) {
            return;
        }

        const grid = new AxisGrid({
            style: {
                color: new Color('orange'),
                fontSize: 12,
                numberFormat: Intl.NumberFormat('fr'),
            },
            ticks: {
                x: 50,
                y: 50,
                z: 50,
            },
            volume: {
                ceiling: box.max.z + 10,
                extent: Extent.fromBox3(this._instance.referenceCrs, box).withMargin(20, 20),
                floor: box.min.z - 10,
            },
        });
        grid.name = `AxisGrid-${dataset.uuid}`;
        await this._instance.add(grid);
        this._axisGrids.set(dataset.uuid, grid);
    }

    private async createMask(dataset: DatasetOrGroup): Promise<void> {
        // TODO: this assumes the dataset covers the whole bounding box
        // (in particular, that it is oriented the same way)
        // which will most likely not be the case...
        const box = this._store.getBoundingBox(dataset);
        if (box == null || box.isEmpty()) {
            return;
        }

        // Contract bounding box so it makes stitching a bit nicer
        box.expandByVector(new Vector3(-5, -5, 0));

        const feature = new Feature({
            geometry: new Polygon([
                [
                    [box.min.x, box.min.y],
                    [box.min.x, box.max.y],
                    [box.max.x, box.max.y],
                    [box.max.x, box.min.y],
                    [box.min.x, box.min.y],
                ],
            ]),
            name: 'Mask polygon',
        });

        const mask = new MaskLayer({
            name: `mask-${dataset.uuid}`,
            source: new Giro3dVectorSource({
                data: [feature],
                style: new Style({
                    fill: new Fill({ color: 'white' }),
                }),
            }),
        });
        mask.maskMode = MaskMode.Inverted;

        // Apply the mask to the map
        const maps = this._instance.getObjects(obj => isMap(obj)) as Giro3DMap[];
        for (const map of maps) {
            await map.addLayer(mask);
            this._instance.notifyChange(map);
        }
        this._masks.set(dataset.uuid, mask);
    }

    private deleteDataset(dataset: DatasetOrGroup): void {
        this.deleteGrid(dataset);
        this.deleteMask(dataset);

        const entities = this._entities.get(dataset.uuid);
        if (entities) {
            for (const entity of entities) {
                this._instance.remove(entity);
            }
            this._instance.notifyChange();
            this._entities.delete(dataset.uuid);
        }

        const layers = this._layers.get(dataset.uuid);
        if (layers) {
            for (const layer of layers) {
                this._layerManager.removeLayer(layer);
            }
            this._layers.delete(dataset.uuid);
        }

        GLOBAL_EVENT_DISPATCHER.dispatchEvent({ type: 'dataset-removed', value: dataset });
    }

    private deleteGrid(dataset: DatasetOrGroup): void {
        const grid = this._axisGrids.get(dataset.uuid);
        if (grid) {
            this._instance.remove(grid);
        }
        this._axisGrids.delete(dataset.uuid);
    }

    private deleteMask(dataset: DatasetOrGroup): void {
        const mask = this._masks.get(dataset.uuid);
        if (mask) {
            const maps = this._instance.getObjects(obj => isMap(obj)) as Giro3DMap[];
            maps.forEach(map => {
                map.removeLayer(mask);
                this._instance.notifyChange(map);
            });
        }
        this._masks.delete(dataset.uuid);
    }

    private async importFromFile(file: File | string): Promise<void> {
        let dataset: DatasetOrGroup;
        const name = file instanceof File ? file.name : file;
        try {
            this._notifications.push(new Notification(name, 'Importing file...'));
            const _dataset = await loader.importFile(file, getConfig());
            dataset = this._store.add(_dataset); // We need to keep track of the reactive dataset!
            this._notifications.push(
                new Notification(dataset.name, 'Import done, parsing data...', 'success'),
            );
        } catch (e) {
            console.error(e);
            this._notifications.push(new Notification(name, (e as Error).message, 'error'));
            return;
        }

        try {
            dataset.state = DatasetState.Loading;
            await this.preloadDataset(dataset);
            this._notifications.push(
                new Notification(dataset.name, 'Import successful.', 'success'),
            );
        } catch (_e) {
            // Already logged, ignore
        }

        GLOBAL_EVENT_DISPATCHER.dispatchEvent({ type: 'dataset-added', value: dataset });
    }

    private async onOpacityChanged(dataset: Dataset, opacity: number): Promise<void> {
        try {
            dataset.opacity = opacity;
            await this.updateDataset(dataset);
        } catch (e) {
            console.warn(e);
        }

        GLOBAL_EVENT_DISPATCHER.dispatchEvent({
            type: 'dataset-opacity-changed',
            value: dataset,
        });
    }

    private async onToggleGrid(dataset: DatasetOrGroup): Promise<void> {
        if (this._axisGrids.has(dataset.uuid)) {
            this.deleteGrid(dataset);
        } else {
            await this.createGrid(dataset);
        }
    }

    private async onToggleMask(dataset: DatasetOrGroup): Promise<void> {
        if (this._masks.has(dataset.uuid)) {
            this.deleteMask(dataset);
        } else {
            await this.createMask(dataset);
        }
    }
    private async onVisibilityChanged(
        dataset: DatasetOrGroup,
        newVisibility: boolean,
    ): Promise<void> {
        try {
            dataset.visibleSelf = newVisibility;
            if (dataset.state !== DatasetState.Loaded && newVisibility) {
                await this.preloadDataset(dataset);
            }
            await this.updateDataset(dataset);
            if (Datagroup.isGroup(dataset)) {
                dataset.children.forEach(ds => void this.onVisibilityChanged(ds, ds.visibleSelf));
            }
        } catch (_e) {
            dataset.visibleSelf = false;
        }

        GLOBAL_EVENT_DISPATCHER.dispatchEvent({
            type: 'dataset-visibility-changed',
            value: dataset,
        });
    }

    private async preloadDataset(dataset: DatasetOrGroup): Promise<DatasetOrGroup> {
        if (dataset.state === DatasetState.Loaded) {
            return Promise.resolve(dataset);
        }

        if (Datagroup.isGroup(dataset)) {
            dataset.state = DatasetState.Loaded;
            return Promise.resolve(dataset);
        }

        dataset.state = DatasetState.Loading;

        try {
            await this.buildDatasetObjects(dataset);
            dataset.state = DatasetState.Loaded;
        } catch (e) {
            console.error('Could not load dataset', dataset, e);
            this._notifications.push(
                new Notification(
                    dataset.name,
                    `Could not load dataset : ${(e as Error).message}`,
                    'error',
                ),
            );
            dataset.state = DatasetState.Failed;
            throw e;
        }

        return dataset;
    }

    private async updateDataset(dataset: DatasetOrGroup): Promise<void> {
        const entities = this._entities.get(dataset.uuid);
        if (entities) {
            for (const entity of entities) {
                entity.visible = dataset.visible;
                entity.opacity = dataset.opacity;
                if (
                    dataset.visibleSelf &&
                    'isMaskingBasemap' in dataset.config &&
                    dataset.config.isMaskingBasemap === true
                ) {
                    await this.createMask(dataset);
                } else if (!dataset.visibleSelf && this._masks.has(dataset.uuid)) {
                    this.deleteMask(dataset);
                }
                this._instance.notifyChange(entity);
            }
        }

        const layers = this._layers.get(dataset.uuid);
        if (layers) {
            for (const layer of layers) {
                this._layerManager.setLayerVisibility(layer, dataset.visible);
                this._layerManager.setLayerOpacity(layer, dataset.opacity);
                this._layerManager.notify(layer);
            }
        }
    }
}
