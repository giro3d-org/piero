<script setup lang="ts">
    import { MathUtils } from 'three';
    import DatasetItem from '@/components/panels/DatasetItem.vue';
    import ListLinkLabel from '@/components/atoms/ListLinkLabel.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import CompactList from '@/components/atoms/CompactList.vue';
    import { useDatasetStore } from '@/stores/datasets';
    import { Dataset } from '@/types/Dataset';

    const store = useDatasetStore();

    defineProps<{
        group: string;
        datasets: Dataset[];
    }>();

    defineEmits(['zoom', 'clipTo', 'updated']);

    const id = MathUtils.generateUUID();
    const target = `#${id}`;
</script>

<template>
    <div v-if="datasets.length">
        <div class="d-flex">
            <IconList class="me-1">
                <IconListButton
                    title="Expand group"
                    icon="bi-chevron-down"
                    data-bs-toggle="collapse"
                    :data-bs-target="target"
                    :aria-controls="id"
                    aria-expanded="false"
                />
            </IconList>
            <ListLinkLabel class="label" href="#" :text="group" :title="group" />
        </div>

        <CompactList :id="id" class="collapse">
            <DatasetItem
                v-for="dataset in datasets"
                :key="dataset.name"
                :dataset="dataset"
                v-on:zoom="() => $emit('zoom', dataset)"
                v-on:clip-to="() => $emit('clipTo', dataset)"
                v-on:delete="store.remove(dataset)"
                @update:toggle-grid="store.toggleGrid(dataset)"
                @update:toggle-mask="store.toggleMask(dataset)"
                v-on:update:visible="v => store.setVisible(dataset, v)"
            />
        </CompactList>
    </div>
</template>

<style scoped>
    .label {
        min-width: 50%;
    }
</style>
