<script setup lang="ts">
    import { useDatasetStore } from '@/stores/datasets';
    import { type Dataset, DatasetState } from '@/types/Dataset';
    import { refAndWatch } from '@/utils/Components';

    import type IfcEntity from './IfcEntity';
    import type { ClassificationItem } from './IfcEntity';

    import IfcSubtree from './IfcSubtree.vue';

    const datasets = useDatasetStore();

    const props = defineProps<{
        dataset: Dataset;
    }>();

    const state = refAndWatch(props.dataset, 'state');

    function getClassificationRoot(): ClassificationItem[] | null {
        const ifcEntity = getIfcEntity();

        if (ifcEntity == null) {
            return null;
        }

        return ifcEntity.getClassification();
    }

    function getIfcEntity(): IfcEntity | null {
        const entities = datasets.getEntities(props.dataset);

        if (entities == null) {
            return null;
        }

        return entities[0] as IfcEntity;
    }
</script>

<template>
    <div v-if="state === DatasetState.Loaded">
        <ul>
            <li v-for="(item, index) in getClassificationRoot()" :key="index">
                <IfcSubtree
                    :ifc-entity="getIfcEntity() as IfcEntity"
                    :classification-element="item"
                />
            </li>
        </ul>
    </div>
</template>

<style scoped>
    ul {
        font-size: smaller;
    }
</style>
