<script setup lang="ts">
import { useDatasetStore } from '@/stores/datasets';
import { Dataset } from '@/types/Dataset';
import { IFCModel } from 'three/examples/jsm/loaders/IFCLoader';
import { ref } from 'vue';
import IfcSubtree from './IfcSubtree.vue';
const datasets = useDatasetStore();

const props = defineProps<{
  dataset: Dataset,
}>()

const isLoaded = ref(props.dataset.isLoaded);

datasets.$onAction(({
    after,
    name,
}) => {
    after(() => {
        switch (name) {
            case 'add':
            case 'remove':
            case 'goTo':
            case 'importFromFile':
            case 'getDatasets':
            case 'attachEntity':
            case 'setVisible':
            case 'getEntity':
                isLoaded.value = props.dataset.isLoaded;
                break;
        }
    });
});

function getIfcModel() {
    const entity = datasets.getEntity(props.dataset);

    if (entity == null) {
        return null;
    }

    return entity.object3d as IFCModel;
}

function getRoot() {
    const ifcModel = getIfcModel();

    if (ifcModel == null) {
        return null;
    }

    const structure = ifcModel.ifcManager.getSpatialStructure(ifcModel.modelID);

    return structure;
}
</script>

<template>
    <div v-if="isLoaded">
        <IfcSubtree :ifc-element="getRoot()" :ifc-model="getIfcModel()" />
    </div>
</template>