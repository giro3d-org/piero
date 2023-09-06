import * as THREE from 'three';
import { GeoJSON } from 'ol/format';
import { createXYZ } from 'ol/tilegrid.js';
import { tile } from 'ol/loadingstrategy.js';

import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';

import { Dataset, DatasetObject } from "../../types/Dataset";
import MainController from "./MainController";
import Instance from '@giro3d/giro3d/core/Instance';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import PointCloudMaterial from '../../giro3d/PointCloudMaterial';
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial';
import loader from '../../loaders/loader';
import Camera from './CameraController';
import VectorSource from 'ol/source/Vector';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';
import NotificationController from './NotificationController';
import { useDatasetStore } from '../../stores/datasets';

function zoomOn(dataset: Dataset) {
    controller?.zoom(dataset);
}

function importFromFile(file: File) {
    controller.importFromFile(file);
}

let controller: DatasetController;

MainController.onInit(ctrl => {
    controller = new DatasetController(ctrl);
});

class DatasetController {
    private readonly instance: Instance;
    private readonly entities: Map<string, Entity3D> = new Map();
    private readonly camera: Camera;

    constructor(mainController: MainController) {
        this.instance = mainController.mainInstance;
        this.camera = mainController.camera;
        const store = useDatasetStore();

        store.$onAction(({
            name,
            args,
        }) => {
            switch (name) {
                case 'remove': this.deleteDataset(args[0]);
                    break;
            }
        });

        for (const dataset of store.datasets) {
            this.registerDataset(dataset);

            if (dataset.visible) {
                this.loadDataset(dataset);
            }
        }
    }

    registerDataset(dataset: Dataset) {
        dataset.addEventListener('visible', () => this.onVisibilityChanged(dataset));
    }

    onVisibilityChanged(dataset: Dataset) {
        if (!dataset.isLoaded && dataset.visible) {
            this.loadDataset(dataset).then(() => this.updateDataset(dataset));
        } else {
            this.updateDataset(dataset);
        }
    }

    loadPointCloud(dataset: Dataset) {
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

    zoom(dataset: Dataset) {
        const entity = this.entities.get(dataset.uuid);
        if (entity) {
            this.camera.lookTopDownAt(entity);
        }
    }

    loadIFC(dataset: Dataset) {
        return loader.processFile(this.instance, dataset.url)
    }

    loadCityJSON(dataset: Dataset) {
        return loader.processFile(this.instance, dataset.url);
    }

    loadBDTopo(dataset: Dataset): Entity3D {
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
                    + '&SRSNAME=EPSG:2154'
                    + '&startIndex=0'
                    + '&bbox='}${e.join(',')},EPSG:2154`
                );
            },
            strategy: tile(createXYZ({ tileSize: 512 })),
        });

        const entity = new FeatureCollection('BDTOPO_V3', {
            source: vectorSource,
            extent: new Extent('EPSG:2154', -111629.52, 1275028.84, 5976033.79, 7230161.64),
            material: new THREE.MeshLambertMaterial(),
            extrude: feature => {
                const hauteur = -feature.getProperties().hauteur;
                if (Number.isNaN(hauteur)) {
                    return null;
                }
                return hauteur;
            },
            style: feature => {
                const properties = feature.getProperties();
                let color = '#FFFFFF';
                if (properties.usage_1 === 'Résidentiel') {
                    color = '#9d9484';
                } else if (properties.usage_1 === 'Commercial et services') {
                    color = '#b0ffa7';
                }
                return { color };
            },
            onMeshCreated: mesh => {
                // hide this particular mesh because we have a ifc for this
                if (mesh.userData.id === 'batiment.BATIMENT0000000240851971'
                    || mesh.userData.id === 'batiment.BATIMENT0000000240851972') {
                    mesh.visible = false;
                }
            },
            minLevel: 11,
            maxLevel: 11,
        });

        return entity;
    }

    async importFromFile(file: File) {
        try {
            const result = await loader.processFile(this.instance, file);

            let entity: Entity3D = result.obj;
            let dataset: Dataset;

            switch (result.filetype) {
                case 'gpkg':
                case 'las':
                    dataset = new DatasetObject(result.filename, 'pointcloud');
                    break;
                case 'csv':
                case 'cityjson':
                case 'geojson':
                case 'ifc':
                    // TODO
                    break;
            }

            dataset.visible = true;
            this.registerDataset(dataset);
            this.entities.set(dataset.uuid, result.obj);
            this.instance.add(entity);
            this.instance.notifyChange(entity);

            const store = useDatasetStore();
            store.add(dataset);

            this.onDatasetLoaded(dataset, entity);

            NotificationController.showNotification(result.filename, 'Import successful.', 'success');
        } catch (e) {
            const error = e as Error;
            NotificationController.showNotification(file.name, error.message, 'error');
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

    onDatasetLoaded(dataset: Dataset, entity: Entity3D) {
        entity.object3d.userData.entity = entity;
        entity.object3d.userData.name = dataset.name;

        dataset.isLoaded = true;
        dataset.isLoading = false;
    }

    async loadDataset(dataset: Dataset) {
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

export default {
    importFromFile,
    zoomOn,
}