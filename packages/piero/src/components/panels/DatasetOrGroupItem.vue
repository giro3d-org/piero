<script setup lang="ts">
    import { useTemplateRef } from 'vue';

    import type { Dataset, DatasetOrGroup } from '@/types/Dataset';

    import DatagroupItem from '@/components/panels/DatagroupItem.vue';
    import DatasetItem from '@/components/panels/DatasetItem.vue';
    import { Datagroup } from '@/types/Dataset';

    const groupRef = useTemplateRef<InstanceType<typeof DatagroupItem>>('groupRef');
    const datasetRef = useTemplateRef<InstanceType<typeof DatasetItem>>('datasetRef');
    const item = useTemplateRef('item');

    const props = defineProps<{
        dataset: DatasetOrGroup;
    }>();

    defineEmits<{
        showParameters: [value: Dataset];
        'update:expanded': [ds: Dataset, expanded: boolean];
        'update:visible': [ds: Dataset, visible: boolean];
        zoom: [value: Dataset];
    }>();

    function filter(query: string, type: string, uuids: string[]): boolean {
        const result = filterResult(query, type, uuids);
        if (item.value != null) {
            item.value.hidden = !result;
        }
        return result;
    }

    function filterResult(query: string, type: string, uuids: string[]): boolean {
        if (Datagroup.isGroup(props.dataset)) {
            if (groupRef.value == null) {
                return false;
            }
            return groupRef.value.filter(query, type, uuids);
        } else {
            if (datasetRef.value == null) {
                return false;
            }
            return datasetRef.value.filter(query, type, uuids);
        }
    }

    defineExpose({
        filter,
    });
</script>

<template>
    <li class="list-group-item" ref="item">
        <DatagroupItem
            v-if="Datagroup.isGroup(dataset)"
            ref="groupRef"
            :group="dataset"
            @zoom="ds => $emit('zoom', ds)"
            @show-parameters="ds => $emit('showParameters', ds)"
            @update:visible="(ds, v) => $emit('update:visible', ds, v)"
            @update:expanded="(ds, v) => $emit('update:expanded', ds, v)"
        />
        <DatasetItem
            v-else
            ref="datasetRef"
            :dataset="dataset"
            @show-parameters="ds => $emit('showParameters', ds)"
            @zoom="ds => $emit('zoom', ds)"
            @update:visible="(ds, v) => $emit('update:visible', ds, v)"
        />
    </li>
</template>
