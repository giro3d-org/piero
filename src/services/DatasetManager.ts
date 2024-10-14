import EntityBuilder from '@/giro3d/EntityBuilder';
import LayerBuilder from '@/giro3d/LayerBuilder';
import loader from '@/loaders/loader';
import { useDatasetStore } from '@/stores/datasets';
import { useNotificationStore } from '@/stores/notifications';
import type { Dataset, DatasetBase } from '@/types/Dataset';
import { Datagroup, type DatasetLayer, type DatasetOrGroup } from '@/types/Dataset';
import Notification from '@/types/Notification';
import type { DatasetAsLayerConfig, DatasetAsMeshConfig } from '@/types/configuration/datasets';
import { isObject } from '@/utils/Types';
import type Instance from '@giro3d/giro3d/core/Instance';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import MaskLayer, { MaskMode } from '@giro3d/giro3d/core/layer/MaskLayer';
import AxisGrid from '@giro3d/giro3d/entities/AxisGrid';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type Giro3DMap from '@giro3d/giro3d/entities/Map';
import { isMap } from '@giro3d/giro3d/entities/Map';
import Giro3dVectorSource from '@giro3d/giro3d/sources/VectorSource';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { Fill, Style } from 'ol/style';
import { Color, Vector3 } from 'three';
import type LayerManager from './LayerManager';

const datasetSupportsOverlay = (obj: Dataset): obj is Dataset & DatasetBase<DatasetAsLayerConfig> =>
    isObject(obj) &&
    (obj.type === 'colorLayer' || obj.type === 'maskLayer' || obj.type === 'elevationLayer');

const datasetSupportsMeshes = (obj: Dataset): obj is Dataset & DatasetBase<DatasetAsMeshConfig> =>
    isObject(obj) && !datasetSupportsOverlay(obj);

export default class DatasetManager {
    private readonly _instance: Instance;
    private readonly _layerManager: LayerManager;
    private readonly _entities: Map<string, Entity3D> = new Map();
    private readonly _overlays: Map<string, DatasetLayer> = new Map();
    private readonly _axisGrids: Map<string, AxisGrid> = new Map();
    private readonly _masks: Map<string, MaskLayer> = new Map();
    private readonly _store = useDatasetStore();
    private readonly _notifications = useNotificationStore();

    constructor(instance: Instance, layerManager: LayerManager) {
        this._instance = instance;
        this._layerManager = layerManager;

        this._store.$onAction(({ name, args, after }) => {
            after(() => {
                switch (name) {
                    case 'remove':
                        this.deleteDataset(args[0]);
                        break;
                    case 'importFromFile':
                        this.importFromFile(args[0]);
                        break;
                    case 'setVisible':
                        this.onVisibilityChanged(args[0], args[1]);
                        break;
                    case 'toggleGrid':
                        this.onToggleGrid(args[0]);
                        break;
                    case 'toggleMask':
                        this.onToggleMask(args[0]);
                        break;
                }
            });
        });

        for (const dataset of this._store.getDatasets()) {
            if (dataset.visible) {
                this.preloadDataset(dataset);
            }
        }
    }

    dispose() {
        // Nothing to do (?)
    }

    private createGrid(dataset: DatasetOrGroup) {
        const box = this._store.getBoundingBox(dataset);
        if (box == null || box.isEmpty()) {
            return;
        }

        const grid = new AxisGrid({
            ticks: {
                x: 50,
                y: 50,
                z: 50,
            },
            style: {
                color: new Color('orange'),
                numberFormat: Intl.NumberFormat('fr'),
                fontSize: 12,
            },
            volume: {
                floor: box.min.z - 10,
                ceiling: box.max.z + 10,
                extent: Extent.fromBox3(this._instance.referenceCrs, box).withMargin(20, 20),
            },
        });
        grid.name = `AxisGrid-${dataset.uuid}`;
        this._instance.add(grid);
        this._axisGrids.set(dataset.uuid, grid);
    }

    private deleteGrid(dataset: DatasetOrGroup) {
        const grid = this._axisGrids.get(dataset.uuid);
        if (grid) {
            this._instance.remove(grid);
        }
        this._axisGrids.delete(dataset.uuid);
    }

    private onToggleGrid(dataset: DatasetOrGroup) {
        if (this._axisGrids.has(dataset.uuid)) {
            this.deleteGrid(dataset);
        } else {
            this.createGrid(dataset);
        }
    }

    private createMask(dataset: DatasetOrGroup) {
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
        maps.forEach(map => {
            map.addLayer(mask);
            this._instance.notifyChange(map);
        });
        this._masks.set(dataset.uuid, mask);
    }

    private deleteMask(dataset: DatasetOrGroup) {
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

    private onToggleMask(dataset: DatasetOrGroup) {
        if (this._masks.has(dataset.uuid)) {
            this.deleteMask(dataset);
        } else {
            this.createMask(dataset);
        }
    }

    private async onVisibilityChanged(dataset: DatasetOrGroup, newVisibility: boolean) {
        try {
            dataset.visible = newVisibility;
            if (!dataset.isPreloaded && newVisibility) {
                await this.preloadDataset(dataset);
            }
            this.updateDataset(dataset);
            if (Datagroup.isGroup(dataset)) {
                dataset.children.forEach(ds => this.onVisibilityChanged(ds, newVisibility));
            }
        } catch (e) {
            dataset.visible = false;
        }
    }

    private async importFromFile(file: File) {
        let dataset: DatasetOrGroup;
        try {
            this._notifications.push(new Notification(file.name, 'Importing file...'));
            const _dataset = await loader.importFile(this._instance, file);
            dataset = this._store.add(_dataset); // We need to keep track of the reactive dataset!
            this._notifications.push(
                new Notification(dataset.name, 'Import done, parsing data...', 'success'),
            );
        } catch (e) {
            console.error(e);
            this._notifications.push(new Notification(file.name, (e as Error).message, 'error'));
            return;
        }

        try {
            dataset.isPreloading = true;
            await this.preloadDataset(dataset);
            this._notifications.push(
                new Notification(dataset.name, 'Import successful.', 'success'),
            );
        } catch (e) {
            // Already logged, ignore
        }
    }

    private updateDataset(dataset: DatasetOrGroup) {
        const entity = this._entities.get(dataset.uuid);
        if (entity) {
            entity.visible = dataset.visible;
            if (
                dataset.visible &&
                'isMaskingBasemap' in dataset.config &&
                dataset.config.isMaskingBasemap === true
            ) {
                this.createMask(dataset);
            } else if (!dataset.visible && this._masks.has(dataset.uuid)) {
                this.deleteMask(dataset);
            }
            this._instance.notifyChange(entity);
        }

        const layer = this._overlays.get(dataset.uuid);
        if (layer) {
            layer.visible = dataset.visible;
            this._layerManager.notify(layer);
        }
    }

    private deleteDataset(dataset: DatasetOrGroup) {
        this.deleteGrid(dataset);
        this.deleteMask(dataset);

        const entity = this._entities.get(dataset.uuid);
        if (entity) {
            this._instance.remove(entity);
            this._instance.notifyChange();
        }

        const layer = this._overlays.get(dataset.uuid);
        if (layer) {
            this._layerManager.removeBasemapLayer(layer);
        }
    }

    private onDatasetPreloaded(dataset: DatasetOrGroup, entity: Entity3D) {
        dataset.isPreloaded = true;
        dataset.isPreloading = false;

        if (dataset.onObjectPreloaded) {
            dataset.onObjectPreloaded(dataset, entity);
        }

        this._store.attachEntity(dataset, entity);
    }

    private onDatasetPreloadedAsLayer(dataset: DatasetOrGroup, layer: DatasetLayer) {
        dataset.isPreloaded = true;
        dataset.isPreloading = false;

        this._store.attachLayer(dataset, layer);
    }

    private async preloadDataset(dataset: DatasetOrGroup) {
        if (dataset.isPreloaded) {
            return dataset;
        }

        if (Datagroup.isGroup(dataset)) {
            dataset.isPreloaded = true;
            return dataset;
        }

        dataset.isPreloading = true;

        try {
            if (datasetSupportsOverlay(dataset)) {
                const layer = await LayerBuilder.getDatasetLayer(this._instance, dataset);

                layer.visible = dataset.visible;
                this._overlays.set(dataset.uuid, layer);

                await this._layerManager.addDatasetLayer(layer);
                this.onDatasetPreloadedAsLayer(dataset, layer);
            } else if (datasetSupportsMeshes(dataset)) {
                const entity = await EntityBuilder.getEntity(this._instance, dataset);

                entity.visible = dataset.visible;
                this._entities.set(dataset.uuid, entity);

                await this._instance.add(entity);
                this.onDatasetPreloaded(dataset, entity);
            } else {
                throw new Error('Dataset is neither an overlay or 3d mesh');
            }
        } catch (e) {
            console.error('Could not load dataset', dataset, e);
            dataset.isPreloading = false;
            this._notifications.push(
                new Notification(
                    dataset.name,
                    `Could not load dataset : ${(e as Error).message}`,
                    'error',
                ),
            );
            throw e;
        }

        return dataset;
    }
}
