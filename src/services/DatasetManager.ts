import { GeoJSON } from 'ol/format';
import { tile } from 'ol/loadingstrategy.js';
import { createXYZ } from 'ol/tilegrid.js';
import VectorSource from 'ol/source/Vector';

import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';

import CameraController from '@/services/CameraController';
import PointCloudMaterial from '@/giro3d/PointCloudMaterial';
import loader from '@/loaders/loader';
import { useDatasetStore } from '@/stores/datasets';
import { useNotificationStore } from '@/stores/notifications';
import { Dataset, DatasetObject, DatasetType } from "@/types/Dataset";
import Notification from '@/types/Notification';
import Instance from '@giro3d/giro3d/core/Instance';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial';
import { Color, MeshLambertMaterial } from 'three';
import { AxisGrid } from '@giro3d/giro3d/entities';

export default class DatasetManager {
    private readonly instance: Instance;
    private readonly entities: Map<string, Entity3D> = new Map();
    private readonly axisGrids: Map<string, AxisGrid> = new Map();
    private readonly camera: CameraController;
    private readonly store = useDatasetStore();

    constructor(instance: Instance, camera: CameraController) {
        this.instance = instance;
        this.camera = camera;

        this.store.$onAction(({
            name,
            args,
            after,
        }) => {
            after(() => {
                switch (name) {
                    case 'remove': this.deleteDataset(args[0]);
                        break;
                    case 'goTo':
                        this.zoom(args[0]);
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
                }
            });
        });

        for (const dataset of this.store.getDatasets()) {
            if (dataset.visible) {
                this.loadDataset(dataset);
            }
        }
    }

    private onToggleGrid(dataset: Dataset) {
        if (this.axisGrids.has(dataset.uuid)) {
            const grid = this.axisGrids.get(dataset.uuid);
            this.instance.remove(grid);
            this.axisGrids.delete(dataset.uuid);
        } else {
            const entity = this.entities.get(dataset.uuid);
            if (!entity) {
                return;
            }
            const box = entity.getBoundingBox();
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
                }
            });
            this.instance.add(grid);
            this.axisGrids.set(dataset.uuid, grid);
        }
    }

    private onVisibilityChanged(dataset: Dataset, newVisibility: boolean) {
        if (!dataset.isLoaded && newVisibility) {
            this.loadDataset(dataset).then(() => this.updateDataset(dataset));
        } else {
            this.updateDataset(dataset);
        }
    }

    private loadPointCloud(dataset: Dataset) {
        const pointcloud = new Tiles3D(
            `pointcloud-${dataset.name}`,
            new Tiles3DSource(dataset.url),
            {
                material: new PointCloudMaterial({
                    size: 2,
                    mode: MODE.ELEVATION,
                }),
            },
        );
        return pointcloud;
    }

    private zoom(dataset: Dataset) {
        const entity = this.entities.get(dataset.uuid);
        if (entity) {
            this.camera.lookTopDownAt(entity);
        }
    }

    private loadIFC(dataset: Dataset) {
        return loader.processFile(this.instance, dataset.url, {
            at:  dataset.coordinates ? dataset.coordinates.as(this.instance.referenceCrs) : undefined,
        });
    }

    private loadCityJSON(dataset: Dataset) {
        return loader.processFile(this.instance, dataset.url, {
            projection: this.instance.referenceCrs,
        });
    }

    private loadBDTopo(dataset: Dataset): Entity3D {
        const crs = this.instance.referenceCrs;

        const vectorSource = new VectorSource({
            format: new GeoJSON(),
            url: function url(e) {
                return (
                    `${'https://wxs.ign.fr/topographie/geoportail/wfs'
                    // 'https://download.data.grandlyon.com/wfs/rdata'
                    + '?SERVICE=WFS'
                    + '&VERSION=2.0.0'
                    + '&request=GetFeature'
                    + '&typename=BDTOPO_V3:batiment'
                    + '&outputFormat=application/json'
                    + `&SRSNAME=${crs}`
                    + '&startIndex=0'
                    + '&bbox='}${e.join(',')},${crs}`
                );
            },
            strategy: tile(createXYZ({ tileSize: 512 })),
        });

        const entity = new FeatureCollection('BDTOPO_V3', {
            source: vectorSource,
            extent: new Extent(crs, -111629.52, 1275028.84, 5976033.79, 7230161.64),
            material: new MeshLambertMaterial(),
            extrusionOffset: feature => {
                const hauteur = -feature.getProperties().hauteur;
                if (Number.isNaN(hauteur)) {
                    return null;
                }
                return hauteur;
            },
            style: feature => {
                const properties = feature.getProperties();
                const fid = feature.getId();
                let color = '#FFFFFF';
                let visible = true;
                if (properties.usage_1 === 'Résidentiel') {
                    color = '#9d9484';
                } else if (properties.usage_1 === 'Commercial et services') {
                    color = '#b0ffa7';
                }

                if (fid === 'batiment.BATIMENT0000000240851971'
                    || fid === 'batiment.BATIMENT0000000240851972') {
                    visible = false;
                }

                return { color, visible };
            },
            minLevel: 11,
            maxLevel: 11,
        });

        return entity;
    }

    private async importFromFile(file: File) {
        const notifications = useNotificationStore();
        try {
            const result = await loader.processFile(this.instance, file);

            let entity: Entity3D = result.obj;
            let type: DatasetType;

            switch (result.filetype) {
                case 'gpkg':
                    // TODO
                    break;
                case 'las':
                    type = 'pointcloud';
                    break;
                case 'csv':
                    // TODO
                    break;
                case 'cityjson':
                    type = 'cityjson';
                    break;
                case 'geojson':
                    // TODO
                    break;
                case 'ifc':
                    type = 'ifc';
                    break;
            }

            const dataset = new DatasetObject(result.filename, type);

            dataset.visible = true;
            this.entities.set(dataset.uuid, result.obj);
            this.instance.add(entity);
            this.instance.notifyChange(entity);

            this.store.add(dataset);

            this.onDatasetLoaded(dataset, entity);

            notifications.push(new Notification(result.filename, 'Import successful.', 'success'));
        } catch (e) {
            console.error(e);
            const error = e as Error;
            notifications.push(new Notification(file.name, error.message, 'error'));
        }
    }

    private updateDataset(dataset: Dataset) {
        const entity = this.entities.get(dataset.uuid);
        if (entity) {
            entity.visible = dataset.visible;
            this.instance.notifyChange(entity);
        }
    }

    private deleteDataset(dataset: Dataset) {
        const entity = this.entities.get(dataset.uuid);
        if (entity) {
            this.instance.remove(entity);
        }
        this.instance.notifyChange();
    }

    private onDatasetLoaded(dataset: Dataset, entity: Entity3D) {
        entity.object3d.userData.entity = entity;
        entity.object3d.userData.dataset = dataset;

        dataset.isLoaded = true;
        dataset.isLoading = false;

        this.store.attachEntity(dataset, entity);
    }

    private async loadDataset(dataset: Dataset) {
        dataset.isLoading = true;

        let entity: Entity3D;
        switch (dataset.type) {
            case 'cityjson':
                entity = (await this.loadCityJSON(dataset)).obj;
                break;
            case 'ifc':
                entity = (await this.loadIFC(dataset)).obj;
                break;
            case 'pointcloud':
                entity = this.loadPointCloud(dataset);
                break;
            case 'bdtopo':
                entity = this.loadBDTopo(dataset);
                break;
        }

        if (entity) {
            entity.visible = dataset.visible;
            this.entities.set(dataset.uuid, entity);
            this.instance.add(entity);
        }

        this.onDatasetLoaded(dataset, entity);

        return dataset;
    }
}
