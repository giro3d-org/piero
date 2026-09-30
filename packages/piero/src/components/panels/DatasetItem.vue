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
    import { ALL_DATASET_TYPES_KEYWORD } from '@/constants';
    import { useDatasetStore } from '@/stores/datasets';
    import { type Dataset, DatasetState } from '@/types/Dataset';
    import { refAndWatch } from '@/utils/components';
    import { formatForSearch } from '@/utils/NameFiltering';

    const store = useDatasetStore();

    const props = defineProps<{
        dataset: Dataset;
    }>();

    defineEmits<{
        showParameters: [value: Dataset];
        'update:visible': [ds: Dataset, visible: boolean];
        zoom: [value: Dataset];
    }>();

    const state = refAndWatch(props.dataset, 'state');
    const isVisible = refAndWatch(props.dataset, 'visibleSelf');

    function deleteDataset(): void {
        store.remove(props.dataset);
    }

    const id = MathUtils.generateUUID();
    const target = `#${id}`;

    const hovered = ref(false);

    function filter(query: string, type: string, uuids: string[]): boolean {
        if (!query && type === ALL_DATASET_TYPES_KEYWORD && uuids.length === 0) {
            return true;
        }
        if (!props.dataset.name) {
            return false;
        }
        const nameMatch = formatForSearch(props.dataset.name).includes(query);
        const typeMatch = type === ALL_DATASET_TYPES_KEYWORD || props.dataset.type === type;
        const uuidMatch = uuids.length === 0 || uuids.indexOf(props.dataset.uuid) !== -1;

        return nameMatch && typeMatch && uuidMatch;
    }

    defineExpose({
        filter,
    });
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
                :title="datasetTitles[dataset.type] ?? dataset.type"
            />
        </IconList>
        <div class="variable-width">
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
                <div v-if="hovered" class="float-end">
                    <!-- <IconListButton
                        v-if="
                            state === DatasetState.Loaded &&
                            (('canMaskBasemap' in dataset.config &&
                                dataset.config.canMaskBasemap) ||
                                ('isMaskingBasemap' in dataset.config &&
                                    dataset.config.isMaskingBasemap))
                        "
                        title="Toggle basemap masking"
                        icon="bi-mask"
                        @click="$emit('update:toggle-mask', dataset)"
                    /> -->

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

                    <!-- <IconListButton
                        v-if="state === DatasetState.Loaded"
                        title="Toggle 3D grid"
                        icon="bi-box"
                        @click="$emit('update:toggle-grid', dataset)"
                    /> -->
                    <IconListButton
                        title="Delete this dataset"
                        icon="bi-trash"
                        @click="deleteDataset"
                    />
                    <IconListButton
                        v-if="state === DatasetState.Loaded"
                        title="Parameters"
                        icon="bi-gear"
                        @click="$emit('showParameters', dataset)"
                    />
                </div>
            </IconList>
        </div>
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
        float: start;
        overflow: hidden;
        /* max-width: 14rem; */
    }

    .variable-width {
        display: flex;
        width: 100%;
    }

    .entry-row:hover {
        background-color: rgba(0, 136, 82, 0.05);
    }

    .parameters {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: red;
    }
</style>
