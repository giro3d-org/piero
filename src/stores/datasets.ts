import { ref, computed, Ref } from 'vue';
import { defineStore } from 'pinia';
import { Box3 } from 'three';
import { type Entity3D } from '@giro3d/giro3d/entities';

import { type Dataset, parseDatasetConfig } from '@/types/Dataset';
import config from '../config';

export const useDatasetStore = defineStore('datasets', () => {
    const datasets = ref(parseDatasetConfig(config.datasets)) as Ref<Dataset[]>;
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

    function getBoundingBox(dataset: Dataset): Box3 {
        const entity = getEntity(dataset);
        return entity?.getBoundingBox() ?? new Box3();
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
    function toggleGrid(ds: Dataset) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function toggleMask(ds: Dataset) {}

    return {
        count,
        getDatasets,
        add,
        remove,
        goTo,
        clipTo,
        importFromFile,
        setVisible,
        getBoundingBox,
        getEntity,
        attachEntity,
        toggleGrid,
        toggleMask,
    };
});
