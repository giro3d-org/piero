<script setup lang="ts">
    import type { Dataset, DatasetOrGroup } from '@/types/Dataset';

    import DatagroupItem from '@/components/panels/DatagroupItem.vue';
    import DatasetItem from '@/components/panels/DatasetItem.vue';
    import { Datagroup } from '@/types/Dataset';

    defineProps<{
        dataset: DatasetOrGroup;
    }>();

    defineEmits<{
        showParameters: [value: Dataset];
        'update:visible': [ds: Dataset, visible: boolean];
        zoom: [value: Dataset];
    }>();
</script>

<template>
    <li class="list-group-item">
        <DatagroupItem
            v-if="Datagroup.isGroup(dataset)"
            :group="dataset"
            @zoom="ds => $emit('zoom', ds)"
            @show-parameters="ds => $emit('showParameters', ds)"
            @update:visible="(ds, v) => $emit('update:visible', ds, v)"
        />
        <DatasetItem
            v-else
            :dataset="dataset"
            @show-parameters="ds => $emit('showParameters', ds)"
            @zoom="ds => $emit('zoom', ds)"
            @update:visible="(ds, v) => $emit('update:visible', ds, v)"
        />
    </li>
</template>
