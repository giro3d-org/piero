<script setup lang="ts">
    import DatagroupItem from '@/components/panels/DatagroupItem.vue';
    import DatasetItem from '@/components/panels/DatasetItem.vue';
    import type { DatasetOrGroup } from '@/types/Dataset';
    import { Datagroup } from '@/types/Dataset';

    defineProps<{
        dataset: DatasetOrGroup;
    }>();

    defineEmits(['zoom', 'clipTo', 'update:toggle-grid', 'update:toggle-mask', 'update:visible']);
</script>

<template>
    <li class="list-group-item">
        <DatagroupItem
            v-if="Datagroup.isGroup(dataset)"
            :group="dataset"
            @zoom="ds => $emit('zoom', ds)"
            @clip-to="ds => $emit('clipTo', ds)"
            @update:toggle-grid="ds => $emit('update:toggle-grid', ds)"
            @update:toggle-mask="ds => $emit('update:toggle-mask', ds)"
            @update:visible="(ds, v) => $emit('update:visible', ds, v)"
        />
        <DatasetItem
            v-else
            :dataset="dataset"
            @zoom="ds => $emit('zoom', ds)"
            @clip-to="ds => $emit('clipTo', ds)"
            @update:toggle-grid="ds => $emit('update:toggle-grid', ds)"
            @update:toggle-mask="ds => $emit('update:toggle-mask', ds)"
            @update:visible="(ds, v) => $emit('update:visible', ds, v)"
        />
    </li>
</template>
