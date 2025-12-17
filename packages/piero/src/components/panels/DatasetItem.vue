<script setup lang="ts">
    import { MathUtils } from 'three';
    import { ref } from 'vue';

    import Icon from '@/components/atoms/Icon.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import ListLabelButton from '@/components/atoms/ListLabelButton.vue';
    import { datasetIcons, datasetTitles, propertyViews } from '@/components/Configuration';
    import SpinnerControl from '@/components/SpinnerControl.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';
    import { useDatasetStore } from '@/stores/datasets';
    import { type Dataset, DatasetState } from '@/types/Dataset';
    import { refAndWatch } from '@/utils/Components';

    const store = useDatasetStore();

    const props = defineProps<{
        dataset: Dataset;
    }>();

    defineEmits(['zoom', 'clipTo', 'update:toggle-grid', 'update:toggle-mask', 'update:visible']);

    const state = refAndWatch(props.dataset, 'state');
    const isVisible = refAndWatch(props.dataset, 'visibleSelf');

    function deleteDataset(): void {
        store.remove(props.dataset);
    }

    const id = MathUtils.generateUUID();
    const target = `#${id}`;

    const hovered = ref(false);
</script>

<template>
    <div
        class="d-flex entry-row"
        v-on:mouseenter="() => (hovered = true)"
        v-on:mouseleave="() => (hovered = false)"
    >
        <IconListButton
            v-if="!propertyViews.has(dataset.type) || state !== DatasetState.Loaded"
            style="opacity: 0%"
            title="Expand group"
            icon="bi-chevron-down"
            data-bs-toggle="collapse"
            class="me-1"
            :data-bs-target="target"
            :aria-controls="id"
            aria-expanded="false"
        />
        <IconListButton
            v-if="propertyViews.has(dataset.type) && state === DatasetState.Loaded"
            title="Show dataset properties"
            icon="bi-chevron-down"
            data-bs-toggle="collapse"
            class="me-1"
            :data-bs-target="`#properties-${dataset.uuid}`"
            :aria-controls="`properties-${dataset.uuid}`"
            aria-expanded="false"
        />
        <VisibilityControl
            :visible="isVisible"
            @update:visible="v => $emit('update:visible', dataset, v)"
        />
        <IconList class="text-body-tertiary">
            <Icon
                :icon="datasetIcons[dataset.type] ?? 'bi-file-earmark-x'"
                :title="datasetTitles[dataset.type] ?? 'Unknown'"
            />
        </IconList>
        <ListLabelButton
            class="label"
            :disabled="!isVisible || state !== DatasetState.Loaded"
            :text="dataset.name"
            :title="`Zoom to ${dataset.name}`"
            @click="$emit('zoom', dataset)"
        />
        <IconList class="ms-1">
            <div v-if="state === DatasetState.Loading" class="icon spinner d-inline-block me-1">
                <SpinnerControl title="Loading..." />
            </div>
            <div v-if="state === DatasetState.Failed" class="d-inline-block">
                <Icon
                    class="text-secondary me-1"
                    icon="bi-exclamation-triangle-fill"
                    title="Failed to load"
                />
            </div>

            <!-- Action buttons -->
            <div v-if="hovered">
                <IconListButton
                    v-if="
                        state === DatasetState.Loaded &&
                        (('canMaskBasemap' in dataset.config && dataset.config.canMaskBasemap) ||
                            ('isMaskingBasemap' in dataset.config &&
                                dataset.config.isMaskingBasemap))
                    "
                    title="Toggle basemap masking"
                    icon="bi-mask"
                    @click="$emit('update:toggle-mask', dataset)"
                />

                <IconListButton
                    v-for="action in store.getCustomActions(dataset, {
                        isVisible,
                        isPreloaded: state === DatasetState.Loaded,
                    })"
                    :key="action.title"
                    :title="action.title"
                    :icon="action.icon"
                    @click="action.action(dataset)"
                />

                <IconListButton
                    v-if="state === DatasetState.Loaded"
                    title="Toggle 3D grid"
                    icon="bi-box"
                    @click="$emit('update:toggle-grid', dataset)"
                />
                <IconListButton
                    title="Delete this dataset"
                    icon="bi-trash"
                    @click="deleteDataset"
                />
            </div>
        </IconList>
    </div>
    <!-- Property view -->
    <div
        v-if="propertyViews.has(dataset.type)"
        class="collapse m-2 ms-4 p-2 border rounded"
        :id="`properties-${dataset.uuid}`"
    >
        <component :is="propertyViews.get(dataset.type)" :dataset="dataset"></component>
    </div>
</template>

<style scoped>
    .label {
        min-width: 50%;
    }

    .entry-row:hover {
        font-weight: bold !important;
        background-color: rgba(0, 136, 82, 0.05);
    }
</style>
