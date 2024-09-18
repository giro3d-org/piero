import Feature from 'ol/Feature';
import { Fill, Style } from 'ol/style';
import Polygon from 'ol/geom/Polygon';

import { Color, Vector3 } from 'three';

import Instance from '@giro3d/giro3d/core/Instance';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import MaskLayer, { MaskMode } from '@giro3d/giro3d/core/layer/MaskLayer';
import AxisGrid from '@giro3d/giro3d/entities/AxisGrid';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import Giro3DMap from '@giro3d/giro3d/entities/Map';
import Giro3dVectorSource from '@giro3d/giro3d/sources/VectorSource';

import loader, { datasetSupportsOverlay } from '@/loaders/loader';
import { useDatasetStore } from '@/stores/datasets';
import { useNotificationStore } from '@/stores/notifications';
import { Datagroup, DatasetLayer, DatasetOrGroup } from '@/types/Dataset';
import Notification from '@/types/Notification';

export default class DatasetManager {
    private readonly _instance: Instance;
    private readonly _entities: Map<string, Entity3D> = new Map();
    private readonly _overlays: Map<string, DatasetLayer> = new Map();
    private readonly _axisGrids: Map<string, AxisGrid> = new Map();
    private readonly _masks: Map<string, MaskLayer> = new Map();
    private readonly _store = useDatasetStore();
    private readonly _notifications = useNotificationStore();

    constructor(instance: Instance) {
        this._instance = instance;

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
                this.loadDataset(dataset);
            }
        }
    }

    dispose() {
        // Nothing to do (?)
    }

    private getMap(): Giro3DMap | undefined {
        return this._instance.getEntities(e => (e as Giro3DMap).isMap).at(0) as
            | Giro3DMap
            | undefined;
    }

    private createGrid(dataset: DatasetOrGroup) {
        const box = this._store.getBoundingBox(dataset);
        if (!box || box.isEmpty()) {
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
        if (grid) this._instance.remove(grid);
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
        if (!box || box.isEmpty()) {
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
        const maps = this._instance.getObjects(obj => 'isMap' in obj && !!obj.isMap) as Giro3DMap[];
        maps.forEach(map => {
            map.addLayer(mask);
            this._instance.notifyChange(map);
        });
        this._masks.set(dataset.uuid, mask);
    }

    private deleteMask(dataset: DatasetOrGroup) {
        const mask = this._masks.get(dataset.uuid);
        if (mask) {
            const maps = this._instance.getObjects(
                obj => 'isMap' in obj && !!obj.isMap,
            ) as Giro3DMap[];
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
                await this.loadDataset(dataset);
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
        try {
            this._notifications.push(new Notification(file.name, 'Importing file...'));
            const { dataset, entity } = await loader.importFile(this._instance, file);

            this._entities.set(dataset.uuid, entity);
            this._instance.add(entity);
            this._instance.notifyChange(entity);

            this._store.add(dataset);

            this.onDatasetLoaded(dataset, entity);

            this._notifications.push(
                new Notification(dataset.name, 'Import successful.', 'success'),
            );
        } catch (e) {
            console.error(e);
            const error = e as Error;
            this._notifications.push(new Notification(file.name, error.message, 'error'));
        }
    }

    private updateDataset(dataset: DatasetOrGroup) {
        const entity = this._entities.get(dataset.uuid);
        if (entity) {
            entity.visible = dataset.visible;
            if (
                dataset.visible &&
                'isMaskingBasemap' in dataset.config &&
                dataset.config.isMaskingBasemap
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
            this._instance.notifyChange(this.getMap());
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
            const map = this.getMap();
            map?.removeLayer(layer);
            this._instance.notifyChange(map);
        }
    }

    private onDatasetLoaded(dataset: DatasetOrGroup, entity: Entity3D) {
        dataset.isPreloaded = true;
        dataset.isPreloading = false;

        if (dataset.onObjectPreloaded) {
            dataset.onObjectPreloaded(dataset, entity);
        }

        this._store.attachEntity(dataset, entity);
    }

    private onDatasetLoadedAsOverlay(dataset: DatasetOrGroup, layer: DatasetLayer) {
        dataset.isPreloaded = true;
        dataset.isPreloading = false;

        this._store.attachLayer(dataset, layer);
    }

    private async loadDataset(dataset: DatasetOrGroup) {
        if (dataset.isPreloaded) return dataset;

        if (Datagroup.isGroup(dataset)) {
            dataset.isPreloaded = true;
            return dataset;
        }

        dataset.isPreloading = true;

        try {
            if (datasetSupportsOverlay(dataset)) {
                const layer = await loader.loadDatasetAsOverlay(this._instance, dataset);
                const map = this.getMap();
                if (layer && map) {
                    layer.visible = dataset.visible;
                    this._overlays.set(dataset.uuid, layer);
                    map.addLayer(layer);

                    this.onDatasetLoadedAsOverlay(dataset, layer);
                }
            } else {
                const entity = await loader.loadDataset(this._instance, dataset);

                if (entity) {
                    entity.visible = dataset.visible;
                    this._entities.set(dataset.uuid, entity);
                    this._instance.add(entity);

                    this.onDatasetLoaded(dataset, entity);
                }
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
