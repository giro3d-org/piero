<script setup lang="ts">
    import IfcSubtree from '@/components/panels/ifc/IfcSubtree.vue';
    import type IfcEntity from '@/giro3d/entities/IfcEntity';
    import { useDatasetStore } from '@/stores/datasets';
    import type { Dataset } from '@/types/Dataset';
    import { refAndWatch } from '@/utils/Components';

    const datasets = useDatasetStore();

    const props = defineProps<{
        dataset: Dataset;
    }>();

    const isPreloaded = refAndWatch(props.dataset, 'isPreloaded');

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
    <div v-if="isPreloaded">
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
