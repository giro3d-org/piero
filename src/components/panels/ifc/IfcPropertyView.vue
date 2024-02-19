<script setup lang="ts">
    import IfcSubtree from '@/components/panels/ifc/IfcSubtree.vue';
    import IfcEntity from '@/giro3d/IfcEntity';
    import { Dataset } from '@/types/Dataset';
    import { useDatasetStore } from '@/stores/datasets';
    import { refAndWatch } from '@/utils/Components';

    const datasets = useDatasetStore();

    const props = defineProps<{
        dataset: Dataset;
    }>();

    const isLoaded = refAndWatch(props.dataset, 'isLoaded');
    const ifcEntity = datasets.getEntity(props.dataset) as IfcEntity | undefined;
    const classificationRoot = ifcEntity?.getClassification();
</script>

<template>
    <div v-if="isLoaded && ifcEntity != null">
        <ul>
            <li v-for="(item, index) in classificationRoot" :key="index">
                <IfcSubtree :ifc-entity="ifcEntity" :classification-element="item" />
            </li>
        </ul>
    </div>
</template>

<style scoped>
    ul {
        font-size: smaller;
    }
</style>
