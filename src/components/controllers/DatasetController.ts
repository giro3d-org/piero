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

        for (const ds of datasets) {
            this.loadDataset(ds);
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
        dataset.addEventListener('visible', () => this.updateDataset(dataset));
        dataset.addEventListener('delete', () => this.deleteDataset(dataset));

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
        }

        if (entity) {
            entity.visible = dataset.visible;
            this.entities.set(dataset.uuid, entity);
            this.instance.add(entity);
        }
    }
}

export default {
    getDatasets,
    zoomOn,
}