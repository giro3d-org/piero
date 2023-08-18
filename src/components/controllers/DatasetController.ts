import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';

import Dataset from "../../types/Dataset";
import MainController from "./MainController";
import Instance from '@giro3d/giro3d/core/Instance';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import PointCloudMaterial from '../../giro3d/PointCloudMaterial';
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial';

const lidarHdTiles = [
    // 'Semis_2021_0841_6518_LA93_IGN69',
    // 'Semis_2021_0841_6519_LA93_IGN69',
    'Semis_2021_0841_6520_LA93_IGN69',
    'Semis_2021_0841_6521_LA93_IGN69',
    'Semis_2021_0842_6520_LA93_IGN69',
    'Semis_2021_0842_6521_LA93_IGN69',
];

const datasets = [
    new Dataset('19_rue_Marc_Antoine_Petit.ifc', 'ifc'),
    lidarHdTiles.map(t => new Dataset(`${t}`, 'cityjson')),
    lidarHdTiles.map(t => new Dataset(`${t}`, 'lidarhd')),
].flat()

function getDatasets()  {
    return datasets;
}

function deleteDataset(dataset: Dataset) {
    const index = datasets.indexOf(dataset);
    datasets.splice(index, 1);
}

let controller: DatasetController;

MainController.onInit(ctrl => {
    controller = new DatasetController(ctrl);
});

class DatasetController {
    private readonly instance: Instance;
    private readonly entities: Map<string, Entity3D> = new Map();

    constructor(mainController: MainController) {
        this.instance = mainController.mainInstance;

        for (const ds of datasets) {
            this.loadDataset(ds);
        }
    }

    loadPointCloud(dataset: Dataset) {
        const pointcloud = new Tiles3D(
            `pointcloud-${dataset.name}`,
            new Tiles3DSource(`https://3d.oslandia.com/lyon/3dtiles/${dataset.name}/tileset.json`),
            {
                material: new PointCloudMaterial({
                    size: 2,
                    mode: MODE.ELEVATION,
                }),
            },
        );
        return pointcloud;
    }

    private updateDataset(dataset: Dataset) {
        const entity = this.entities.get(dataset.uuid);
        if (entity) {
            entity.visible = dataset.visible;
            this.instance.notifyChange(entity);
        }
    }

    loadDataset(dataset: Dataset) {
        dataset.addEventListener('visible', () => this.updateDataset(dataset));

        let entity: Entity3D;
        switch (dataset.type) {
            case 'cityjson':
                break;
            case 'ifc':
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
    deleteDataset,
}