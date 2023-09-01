import * as THREE from 'three';
import { GeoJSON } from 'ol/format';
import { createXYZ } from 'ol/tilegrid.js';
import { tile } from 'ol/loadingstrategy.js';

import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';

import Dataset from "../../types/Dataset";
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

const lidarHdTiles = [
    // 'Semis_2021_0841_6518_LA93_IGN69',
    // 'Semis_2021_0841_6519_LA93_IGN69',
    'Semis_2021_0841_6520_LA93_IGN69',
    'Semis_2021_0841_6521_LA93_IGN69',
    'Semis_2021_0842_6520_LA93_IGN69',
    'Semis_2021_0842_6521_LA93_IGN69',
];

const datasets = [
    new Dataset('19_rue_Marc_Antoine_Petit.ifc', 'ifc', 'https://3d.oslandia.com/lyon/19_rue_Marc_Antoine_Petit.ifc'),
    new Dataset('BD TOPO', 'bdtopo', null),
    lidarHdTiles.map(t => new Dataset(`${t}`, 'cityjson', `https://3d.oslandia.com/lyon/${t}.city.json`)),
    lidarHdTiles.map(t => new Dataset(`${t}`, 'lidarhd', `https://3d.oslandia.com/lyon/3dtiles/${t}/tileset.json`)),
].flat()

function getDatasets()  {
    return datasets;
}

function zoomOn(dataset: Dataset) {
    controller?.zoom(dataset);
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

        for (const dataset of datasets) {
            dataset.addEventListener('visible', () => this.onVisibilityChanged(dataset));
            dataset.addEventListener('delete', () => this.deleteDataset(dataset));

            if (dataset.visible) {
                this.loadDataset(dataset);
            }
        }
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
        return loader.processFile(this.instance, null, dataset.url)
    }

    loadCityJSON(dataset: Dataset) {
        return loader.processFile(this.instance, null, dataset.url);
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

    private updateDataset(dataset: Dataset) {
        const entity = this.entities.get(dataset.uuid);
        if (entity) {
            entity.visible = dataset.visible;
            this.instance.notifyChange(entity);
        }
    }

    deleteDataset(dataset: Dataset) {
        const index = datasets.indexOf(dataset);
        datasets.splice(index, 1);
        const entity = this.entities.get(dataset.uuid);
        if (entity) {
            this.instance.remove(entity);
        }
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
            case 'lidarhd':
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

        entity.object3d.userData.entity = entity;

        dataset.isLoaded = true;
        dataset.isLoading = false;

        return dataset;
    }
}

export default {
    getDatasets,
    zoomOn,
}