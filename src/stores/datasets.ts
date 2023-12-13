import { ref, computed, Ref } from 'vue'
import { defineStore } from 'pinia'
import { Dataset, DatasetObject } from '@/types/Dataset'
import config from '../config';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import { Entity3D } from '@giro3d/giro3d/entities';
import { getPublicFolderUrl } from '@/utils/Configuration';
import { DatasetPlyConfig, DatasetBaseConfig } from '@/types/Configuration';

function buildIfcDataset(conf: DatasetBaseConfig) {
    const ds = new DatasetObject(conf.name, 'ifc', getPublicFolderUrl(conf.url));
    if (conf.position) {
        const position = conf.position;
        ds.coordinates = new Coordinates(position.crs, position.x, position.y, position.z ?? 0);
    }
    return ds;
}

function buildPlyDataset(conf: DatasetPlyConfig) {
    const ds = new DatasetObject(conf.name, 'ply', getPublicFolderUrl(conf.url));
    ds.coordinates = new Coordinates(conf.position.crs, conf.position.x, conf.position.y, conf.position.z);
    return ds;
}

function buildCityJsonDataset(conf: DatasetBaseConfig) {
    const ds = new DatasetObject(conf.name, 'cityjson', getPublicFolderUrl(conf.url));
    return ds;
}

function buildPointCloudDataset(conf: DatasetBaseConfig) {
    const ds = new DatasetObject(conf.name, 'pointcloud', getPublicFolderUrl(conf.url));
    return ds;
}

function buildInitialList(): Dataset[] {
    const result: Dataset[] = [];

    for (const conf of config.datasets) {
        let ds: Dataset | null = null;

        switch (conf.type) {
            case 'ifc':
                ds = buildIfcDataset(conf);
                break;
            case 'cityjson':
                ds = buildCityJsonDataset(conf);
                break;
            case 'pointcloud':
                ds = buildPointCloudDataset(conf);
                break;
            case 'bdtopo':
                ds = new DatasetObject(conf.name, 'bdtopo', null);
                break;
            case 'ply':
                ds = buildPlyDataset(conf as DatasetPlyConfig);
                break;
        }

        if (ds === null) throw new Error(`Could not create dataset from configuration ${conf.name} (type ${conf.type})`);

        if (conf.canMaskBasemap) ds.canMaskBasemap = true;
        if (conf.isMaskingBasemap) ds.isMaskingBasemap = true;

        result.push(ds);
    }

    return result;
}

export const useDatasetStore = defineStore('datasets', () => {
    const datasets = ref(buildInitialList()) as Ref<Dataset[]>;
    const count = computed(() => datasets.value.length);

    const entities: Map<string, Entity3D> = new Map();

    function add(ds: Dataset) {
        datasets.value.push(ds);
    }

    function attachEntity(ds: Dataset, entity: Entity3D) {
        entities.set(ds.uuid, entity);
    }

    function remove(ds: Dataset) {
        datasets.value.splice(datasets.value.indexOf(ds), 1);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function goTo(ds: Dataset) {
        // Nothing to do, rely on action listeners.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function clipTo(ds: Dataset) {
        // Nothing to do, rely on action listeners.
    }

    function getEntity(ds: Dataset): Entity3D | undefined {
        return entities.get(ds.uuid);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importFromFile(file: File) {
        // Nothing to do, rely on action listeners.
    }

    function setVisible(ds: Dataset, newVisibility: boolean) {
        ds.visible = newVisibility;
    }

    function getDatasets() {
        return datasets.value;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function toggleGrid(ds: Dataset) {

    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function toggleMask(ds: Dataset) {
    }

    return { count, getDatasets, add, remove, goTo, clipTo, importFromFile, setVisible, getEntity, attachEntity, toggleGrid, toggleMask }
})
