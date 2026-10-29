<script setup lang="ts">
    import { computed, ref } from 'vue';

    import Icon from '@/components/atoms/Icon.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import ListLabelButton from '@/components/atoms/ListLabelButton.vue';
    import { datasetIcons, datasetTitles, propertyViews } from '@/components/Configuration';
    import { showContextMenu } from '@/components/contextmenu/contextMenu';
    import SpinnerControl from '@/components/SpinnerControl.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';
    import { ALL_DATASET_TYPES_KEYWORD } from '@/constants';
    import { useDatasetPanelStore } from '@/stores/datasetPanel';
    import { useDatasetStore } from '@/stores/datasets';
    import { type Dataset, DatasetState } from '@/types/Dataset';
    import { refAndWatch } from '@/utils/components';
    import { formatForSearch } from '@/utils/NameFiltering';

    const store = useDatasetStore();
    const datasetPanelStore = useDatasetPanelStore();

    const props = defineProps<{
        dataset: Dataset;
    }>();

    const isExpanded = computed(() => datasetPanelStore.expandedItems.has(props.dataset.uuid));

    const emits = defineEmits<{
        showParameters: [value: Dataset];
        'update:visible': [ds: Dataset, visible: boolean];
        zoom: [value: Dataset];
    }>();

    const state = refAndWatch(props.dataset, 'state');
    const isVisible = refAndWatch(props.dataset, 'visibleSelf');

    function deleteDataset(): void {
        store.remove(props.dataset);
    }

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

    function onContextMenu(e: MouseEvent): void {
        showContextMenu({
            e,
            items: [
                {
                    condition: props.dataset.state === DatasetState.Loaded,
                    icon: 'bi-zoom-in',
                    label: `Zoom to ${props.dataset.name}`,
                    onClick: (): void => emits('zoom', props.dataset),
                },
                {
                    icon: props.dataset.visible ? 'bi-eye-fill' : 'bi-eye-slash',
                    label: 'Toggle visibility',
                    onClick: (): void =>
                        emits('update:visible', props.dataset, !props.dataset.visible),
                },
                {
                    icon: 'bi-trash',
                    label: 'Delete dataset',
                    onClick: deleteDataset,
                },
                {
                    icon: 'bi-gear',
                    label: 'Settings...',
                    onClick: (): void => emits('showParameters', props.dataset),
                },
                ...store
                    .getCustomActions(props.dataset, {
                        isPreloaded: props.dataset.state === DatasetState.Loaded,
                        isVisible: props.dataset.visibleSelf,
                    })
                    .map(action => ({
                        icon: action.icon,
                        label: action.title,
                        onClick: (): void => action.action(props.dataset),
                    })),
            ],
        });
    }
</script>

<template>
    <div
        class="d-flex entry-row"
        v-on:mouseenter="() => (hovered = true)"
        v-on:mouseleave="() => (hovered = false)"
        @contextmenu="onContextMenu($event)"
    >
        <IconListButton
            v-if="!propertyViews.has(dataset.type) || state !== DatasetState.Loaded"
            style="opacity: 0%"
            title="Show properties"
            icon="bi-plus-square"
            class="me-2"
        />
        <IconListButton
            v-if="propertyViews.has(dataset.type) && state === DatasetState.Loaded"
            title="Show dataset properties"
            :icon="isExpanded ? 'bi-dash-square' : 'bi-plus-square'"
            class="me-2"
            @click="() => datasetPanelStore.setExpanded(dataset.uuid, !isExpanded)"
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
            </IconList>
        </div>
    </div>
    <!-- Property view -->
    <div
        v-if="propertyViews.has(dataset.type) && state === DatasetState.Loaded && isExpanded"
        class="m-2 ms-4 p-2 border rounded"
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
    }

    .variable-width {
        display: flex;
        width: 100%;
    }

    .entry-row:hover {
        background-color: rgba(var(--bs-primary-rgb), 0.08);
    }

    .parameters {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>
