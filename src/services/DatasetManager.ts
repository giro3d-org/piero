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

import loader from '@/loaders/loader';
import { useDatasetStore } from '@/stores/datasets';
import { useNotificationStore } from '@/stores/notifications';
import { Datagroup, DatasetOrGroup } from '@/types/Dataset';
import Notification from '@/types/Notification';

export default class DatasetManager {
    private readonly instance: Instance;
    private readonly entities: Map<string, Entity3D> = new Map();
    private readonly axisGrids: Map<string, AxisGrid> = new Map();
    private readonly masks: Map<string, MaskLayer> = new Map();
    private readonly store = useDatasetStore();

    constructor(instance: Instance) {
        this.instance = instance;

        this.store.$onAction(({ name, args, after }) => {
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

        for (const dataset of this.store.getDatasets()) {
            if (dataset.visible) {
                this.loadDataset(dataset);
            }
        }
    }

    dispose() {
        // Nothing to do (?)
    }

    private onToggleGrid(dataset: DatasetOrGroup) {
        if (this.axisGrids.has(dataset.uuid)) {
            const grid = this.axisGrids.get(dataset.uuid);
            if (grid) this.instance.remove(grid);
            this.axisGrids.delete(dataset.uuid);
        } else {
            const box = this.store.getBoundingBox(dataset);
            if (!box || box.isEmpty()) {
                return;
            }

            const grid = new AxisGrid(`AxisGrid-${dataset.uuid}`, {
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
                    extent: Extent.fromBox3(this.instance.referenceCrs, box).withMargin(20, 20),
                },
            });
            this.instance.add(grid);
            this.axisGrids.set(dataset.uuid, grid);
        }
    }

    private createMask(dataset: DatasetOrGroup) {
        // TODO: this assumes the dataset covers the whole bounding box
        // (in particular, that it is oriented the same way)
        // which will most likely not be the case...
        const box = this.store.getBoundingBox(dataset);
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
        const maps = this.instance.getObjects(obj => 'isMap' in obj && !!obj.isMap) as Giro3DMap[];
        maps.forEach(map => {
            map.addLayer(mask);
            this.instance.notifyChange(map);
        });
        this.masks.set(dataset.uuid, mask);
    }

    private deleteMask(dataset: DatasetOrGroup) {
        const mask = this.masks.get(dataset.uuid);
        if (mask) {
            const maps = this.instance.getObjects(
                obj => 'isMap' in obj && !!obj.isMap,
            ) as Giro3DMap[];
            maps.forEach(map => {
                map.removeLayer(mask);
                this.instance.notifyChange(map);
            });
        }
        this.masks.delete(dataset.uuid);
    }

    private onToggleMask(dataset: DatasetOrGroup) {
        if (this.masks.has(dataset.uuid)) {
            this.deleteMask(dataset);
        } else {
            this.createMask(dataset);
        }
    }

    private async onVisibilityChanged(dataset: DatasetOrGroup, newVisibility: boolean) {
        dataset.visible = newVisibility;
        if (!dataset.isPreloaded && newVisibility) {
            await this.loadDataset(dataset);
        }
        this.updateDataset(dataset);
        if (Datagroup.isGroup(dataset)) {
            dataset.children.forEach(ds => this.onVisibilityChanged(ds, newVisibility));
        }
    }

    private async importFromFile(file: File) {
        const notifications = useNotificationStore();
        try {
            notifications.push(new Notification(file.name, 'Importing file...'));
            const { dataset, entity } = await loader.importFile(this.instance, file);

            this.entities.set(dataset.uuid, entity);
            this.instance.add(entity);
            this.instance.notifyChange(entity);

            this.store.add(dataset);

            this.onDatasetLoaded(dataset, entity);

            notifications.push(new Notification(dataset.name, 'Import successful.', 'success'));
        } catch (e) {
            console.error(e);
            const error = e as Error;
            notifications.push(new Notification(file.name, error.message, 'error'));
        }
    }

    private updateDataset(dataset: DatasetOrGroup) {
        const entity = this.entities.get(dataset.uuid);
        if (entity) {
            entity.visible = dataset.visible;
            if (dataset.visible && dataset.isMaskingBasemap) {
                this.createMask(dataset);
            } else if (!dataset.visible && this.masks.has(dataset.uuid)) {
                this.deleteMask(dataset);
            }
            this.instance.notifyChange(entity);
        }
    }

    private deleteDataset(dataset: DatasetOrGroup) {
        const entity = this.entities.get(dataset.uuid);
        if (entity) {
            this.instance.remove(entity);
        }
        this.instance.notifyChange();
    }

    private onDatasetLoaded(dataset: DatasetOrGroup, entity: Entity3D) {
        dataset.isPreloaded = true;
        dataset.isPreloading = false;

        if (dataset.onObjectPreloaded) {
            dataset.onObjectPreloaded(dataset, entity);
        }

        this.store.attachEntity(dataset, entity);
    }

    private async loadDataset(dataset: DatasetOrGroup) {
        if (dataset.isPreloaded) return dataset;

        if (Datagroup.isGroup(dataset)) {
            dataset.isPreloaded = true;
            return dataset;
        }

        dataset.isPreloading = true;

        const entity = await loader.loadDataset(this.instance, dataset);

        if (entity) {
            entity.visible = dataset.visible;
            this.entities.set(dataset.uuid, entity);
            this.instance.add(entity);

            this.onDatasetLoaded(dataset, entity);
        }

        return dataset;
    }
}
