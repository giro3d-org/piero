<script setup lang="ts">
    import { computed, reactive, ref, useTemplateRef, watch } from 'vue';

    import type { Datagroup, Dataset } from '@/types/Dataset';

    import CompactList from '@/components/atoms/CompactList.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import ListLabelButton from '@/components/atoms/ListLabelButton.vue';
    import { showContextMenu } from '@/components/contextmenu/contextMenu';
    import VisibilityControl from '@/components/VisibilityControl.vue';
    import { ALL_DATASET_TYPES_KEYWORD } from '@/constants';
    import { useDatasetPanelStore } from '@/stores/datasetPanel';
    import { DatasetState } from '@/types/Dataset';

    import DatasetLoadingIndicator from './DatasetLoadingIndicator.vue';
    import DatasetOrGroupItem from './DatasetOrGroupItem.vue';

    const props = defineProps<{
        group: Datagroup;
    }>();

    const emits = defineEmits<{
        showParameters: [value: Dataset];
        'update:visible': [ds: Dataset, visible: boolean];
        zoom: [value: Dataset];
    }>();

    const items = useTemplateRef<InstanceType<typeof DatasetOrGroupItem>[]>('items');
    const store = useDatasetPanelStore();

    const leafs = reactive(props.group.leafs());
    const hasLeafPreloading = ref(false);
    const hasLeafPreloaded = ref(false);
    const isExpanded = computed(
        () => store.expandedItems.has(props.group.uuid) || store.filterExpanded,
    );
    watch(leafs, newValues => {
        hasLeafPreloading.value = newValues.some(v => v.state === DatasetState.Loading);
        hasLeafPreloaded.value = newValues.some(v => v.state === DatasetState.Loaded);
    });

    const isEmpty = props.group.children.length === 0;

    function filter(query: string, type: string, uuids: string[]): boolean {
        if (items.value) {
            let showFolder = false;
            items.value.forEach(item => {
                /** item.filter must be called on every child to determine whether it should be visible or not,
                 * so things like array.some will not work as they do not complete all iterations,
                 * and putting item.filter in the or statement directly can lead to short circuiting skipping the call. */
                const childResult = item.filter(query, type, uuids);
                showFolder = showFolder || childResult;
            });

            return showFolder;
        }
        return !query && type === ALL_DATASET_TYPES_KEYWORD && uuids.length === 0;
    }

    defineExpose({
        filter,
    });
    function onContextMenu(e: MouseEvent): void {
        showContextMenu({
            e,
            items: [
                {
                    icon: 'bi-zoom-in',
                    label: `Zoom to ${props.group.name}`,
                    onClick: (): void => emits('zoom', props.group),
                },
                {
                    icon: props.group.visibleSelf ? 'bi-eye-fill' : 'bi-eye-slash',
                    label: 'Toggle visibility',
                    onClick: (): void => {
                        emits('update:visible', props.group, !props.group.visibleSelf);
                    },
                },
            ],
        });
    }
</script>

<template>
    <div class="d-flex" @contextmenu="onContextMenu($event)">
        <IconList class="me-1">
            <IconListButton
                v-if="!isEmpty"
                title="Expand group"
                :icon="isExpanded ? 'bi-dash-square' : 'bi-plus-square'"
                class="me-1"
                @click="() => store.setExpanded(group.uuid, !isExpanded)"
            />
            <IconListButton
                v-if="isEmpty"
                style="opacity: 0%"
                title="Expand group"
                icon="bi-plus-square"
                class="me-1"
            />
            <VisibilityControl
                :visible="props.group.visibleSelf"
                @update:visible="v => $emit('update:visible', group, v)"
            />
            <IconList class="text-body-tertiary">
                <i class="bi bi-folder2" title="Group" />
            </IconList>
        </IconList>
        <ListLabelButton
            class="label"
            :disabled="!props.group.visible || !hasLeafPreloaded"
            :text="group.name"
            :title="group.name"
        />

        <DatasetLoadingIndicator :item="props.group" />
    </div>

    <CompactList v-if="isExpanded">
        <template v-if="!isEmpty">
            <DatasetOrGroupItem
                v-for="dataset of group.children"
                ref="items"
                :key="dataset.name"
                :dataset="dataset"
                @zoom="ds => $emit('zoom', ds)"
                @show-parameters="ds => $emit('showParameters', ds)"
                @update:visible="(ds, v) => $emit('update:visible', ds, v)"
            />
        </template>
    </CompactList>
</template>

<style scoped>
    .label {
        min-width: 50%;
    }
</style>
