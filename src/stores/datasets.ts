import { ref, computed, Ref } from 'vue'
import { defineStore } from 'pinia'
import { type Dataset, DatasetObject } from '@/types/Dataset'
import config from '../config';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import { type Entity3D } from '@giro3d/giro3d/entities';
import { getPublicFolderUrl } from '@/utils/Configuration';
import { type DatasetConfig } from '@/types/Configuration';

function buildDataset(datasetConfig: DatasetConfig): DatasetObject {
    if (datasetConfig.type === 'bdtopo') {
        return new DatasetObject(datasetConfig.name, 'bdtopo', null);
    }

    const ds = new DatasetObject(datasetConfig.name, datasetConfig.type, getPublicFolderUrl(datasetConfig.url));
    if (datasetConfig.position) {
        const position = datasetConfig.position;
        ds.coordinates = new Coordinates(position.crs ?? config.default_crs, position.x, position.y, position.z ?? 0);
    }
    return ds;
}

function buildInitialList(): Dataset[] {
    const result: Dataset[] = [];

    for (const conf of config.datasets) {
        const ds = buildDataset(conf);

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
