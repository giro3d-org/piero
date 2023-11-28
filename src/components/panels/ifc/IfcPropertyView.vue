<script setup lang="ts">
import { useDatasetStore } from '@/stores/datasets';
import { Dataset } from '@/types/Dataset';
import { ref } from 'vue';
import IfcSubtree from './IfcSubtree.vue';
import IfcEntity from '@/giro3d/IfcEntity';

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

function getIfcEntity() {
    const entity = datasets.getEntity(props.dataset);

    if (entity == null) {
        return null;
    }

    return entity as IfcEntity;
}

function getClassificationRoot() {
    const ifcEntity = getIfcEntity();

    if (ifcEntity == null) {
        return null;
    }

    return ifcEntity.getClassification();
}
</script>

<template>
    <div v-if="isLoaded">
        <ul>
            <li v-for="(item, index) in getClassificationRoot()" :key="index">
                <IfcSubtree :ifc-entity="(getIfcEntity() as IfcEntity)" :classification-element="item" />
            </li>
        </ul>
    </div>
</template>


<style scoped>
ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

li {
    margin-top: 0.2rem;
}
</style>
