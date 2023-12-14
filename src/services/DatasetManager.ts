import { GeoJSON } from 'ol/format';
import { tile } from 'ol/loadingstrategy.js';
import { createXYZ } from 'ol/tilegrid.js';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Fill, Style } from 'ol/style';
import Polygon from 'ol/geom/Polygon';

import { Color, MeshLambertMaterial, Vector3 } from 'three';

import Instance from '@giro3d/giro3d/core/Instance';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import MaskLayer, { MaskMode } from '@giro3d/giro3d/core/layer/MaskLayer';
import AxisGrid from '@giro3d/giro3d/entities/AxisGrid';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';
import Giro3DMap from '@giro3d/giro3d/entities/Map';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';
import Giro3dVectorSource from '@giro3d/giro3d/sources/VectorSource'
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial';

import CameraController from '@/services/CameraController';
import PointCloudMaterial from '@/giro3d/PointCloudMaterial';
import loader, { FileType, ProcessOptions } from '@/loaders/loader';
import { useDatasetStore } from '@/stores/datasets';
import { useNotificationStore } from '@/stores/notifications';
import { Dataset, DatasetObject, DatasetType } from "@/types/Dataset";
import Notification from '@/types/Notification';

/** Mapping between file types and the dataset types */
const datasetTypePerFileType: Partial<Record<FileType, DatasetType>> = {
    // 'gpkg': '', // TODO - once done, remove the Partial ^
    'las': 'pointcloud',
    'csv': 'pointcloud',
    'cityjson': 'cityjson',
    // 'geojson': '', // TODO
    'ifc': 'ifc',
    'ply': 'ply',
} as const;

export default class DatasetManager {
    private readonly instance: Instance;
    private readonly entities: Map<string, Entity3D> = new Map();
    private readonly axisGrids: Map<string, AxisGrid> = new Map();
    private readonly masks: Map<string, MaskLayer> = new Map();
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

    private onToggleGrid(dataset: Dataset) {
        if (this.axisGrids.has(dataset.uuid)) {
            const grid = this.axisGrids.get(dataset.uuid);
            if (grid) this.instance.remove(grid);
            this.axisGrids.delete(dataset.uuid);
        } else {
            const entity = this.entities.get(dataset.uuid);
            if (!entity) {
                return;
            }
            const box = entity.getBoundingBox();
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
                }
            });
            this.instance.add(grid);
            this.axisGrids.set(dataset.uuid, grid);
        }
    }

    private createMask(dataset: Dataset) {
        const entity = this.entities.get(dataset.uuid);
        if (!entity) {
            return;
        }

        // TODO: this assumes the dataset covers the whole bounding box
        // (in particular, that it is oriented the same way)
        // which will most likely not be the case...
        const box = entity.getBoundingBox();
        if (!box || box.isEmpty()) {
            return;
        }

        // Contract bounding box so it makes stitching a bit nicer
        box.expandByVector(new Vector3(-5, -5, 0));

        const feature = new Feature({
            geometry: new Polygon([[
                [box.min.x, box.min.y],
                [box.min.x, box.max.y],
                [box.max.x, box.max.y],
                [box.max.x, box.min.y],
                [box.min.x, box.min.y]
            ]]),
            name: 'Mask polygon',
        });

        const mask = new MaskLayer(`mask-${dataset.uuid}`, {
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

    private deleteMask(dataset: Dataset) {
        const mask = this.masks.get(dataset.uuid);
        if (mask) {
            const maps = this.instance.getObjects(obj => 'isMap' in obj && !!obj.isMap) as Giro3DMap[];
            maps.forEach(map => {
                map.removeLayer(mask);
                this.instance.notifyChange(map);
            });
        }
        this.masks.delete(dataset.uuid);
    }

    private onToggleMask(dataset: Dataset) {
        if (this.masks.has(dataset.uuid)) {
            this.deleteMask(dataset);
        } else {
            this.createMask(dataset);
        }
    }

    private onVisibilityChanged(dataset: Dataset, newVisibility: boolean) {
        if (!dataset.isLoaded && newVisibility) {
            this.loadDataset(dataset).then(() => this.updateDataset(dataset));
        } else {
            this.updateDataset(dataset);
        }
    }

    private loadPointCloud(dataset: Dataset): Tiles3D {
        if (dataset.url === null) throw new Error(`Cannot load ${dataset.name}: empty url`);

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

    private async loadDefault(dataset: Dataset, options: ProcessOptions): Promise<Entity3D> {
        if (dataset.url === null) throw new Error(`Cannot load ${dataset.name}: empty url`);
        const result = await loader.processFile(this.instance, dataset.url, options);
        return result.obj;
    }

    private loadIFC(dataset: Dataset): Promise<Entity3D> {
        return this.loadDefault(dataset, {
            at: dataset.coordinates ? dataset.coordinates.as(this.instance.referenceCrs) : undefined,
        });
    }

    private loadPLY(dataset: Dataset): Promise<Entity3D> {
        if (!dataset.coordinates) throw new Error(`Cannot load ${dataset.name}: no coordinates set`);
        return this.loadDefault(dataset, {
            at: dataset.coordinates.as(this.instance.referenceCrs),
        });
    }

    private loadCityJSON(dataset: Dataset): Promise<Entity3D> {
        return this.loadDefault(dataset, {
            projection: this.instance.referenceCrs,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            extrusionOffset: (feature: Feature) => {
                const hauteur = -feature.getProperties().hauteur;
                if (Number.isNaN(hauteur)) {
                    return 0;
                }
                return hauteur;
            },
            style: (feature: Feature) => {
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

                return { color: new Color(color), visible };
            },
            minLevel: 11,
            maxLevel: 11,
        });

        return entity;
    }

    private async importFromFile(file: File) {
        const notifications = useNotificationStore();
        try {
            loader.checkCanProcessFile(file, true);

            const { obj: entity, filetype, filename } = await loader.processFile(this.instance, file);
            const type = datasetTypePerFileType[filetype];

            if (!type) {
                throw new Error(`File type ${filetype} not supported`);
            }

            const dataset = new DatasetObject(filename, type, null);

            dataset.visible = true;
            this.entities.set(dataset.uuid, entity);
            this.instance.add(entity);
            this.instance.notifyChange(entity);

            this.store.add(dataset);

            this.onDatasetLoaded(dataset, entity);

            notifications.push(new Notification(filename, 'Import successful.', 'success'));
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
            if (dataset.visible && dataset.isMaskingBasemap) {
                this.createMask(dataset);
            } else if (!dataset.visible && this.masks.has(dataset.uuid)) {
                this.deleteMask(dataset);
            }
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

        let entity: Entity3D | undefined;
        switch (dataset.type) {
            case 'cityjson':
                entity = await this.loadCityJSON(dataset);
                break;
            case 'ifc':
                entity = await this.loadIFC(dataset);
                break;
            case 'ply':
                entity = await this.loadPLY(dataset);
                break;
            case 'pointcloud':
                // @ts-ignore
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

            this.onDatasetLoaded(dataset, entity);
        }

        return dataset;
    }
}
