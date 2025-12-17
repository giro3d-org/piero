<script setup lang="ts">
    import { MathUtils } from 'three';
    import { reactive, ref, watch } from 'vue';

    import type { Datagroup, Dataset } from '@/types/Dataset';

    import CompactList from '@/components/atoms/CompactList.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import ListLabelButton from '@/components/atoms/ListLabelButton.vue';
    import DatasetOrGroupItem from '@/components/panels/DatasetOrGroupItem.vue';
    import SpinnerControl from '@/components/SpinnerControl.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';
    import { DatasetState } from '@/types/Dataset';

    const props = defineProps<{
        group: Datagroup;
    }>();

    defineEmits<{
        showParameters: [value: Dataset];
        'update:visible': [ds: Dataset, visible: boolean];
        zoom: [value: Dataset];
    }>();

    const leafs = reactive(props.group.leafs());
    const hasLeafPreloading = ref(false);
    const hasLeafPreloaded = ref(false);
    const isVisible = ref(props.group.visibleSelf);
    watch(leafs, newValues => {
        hasLeafPreloading.value = newValues.some(v => v.state === DatasetState.Loading);
        hasLeafPreloaded.value = newValues.some(v => v.state === DatasetState.Loaded);
        isVisible.value = newValues.some(v => v.visibleSelf);
    });

    const id = MathUtils.generateUUID();
    const target = `#${id}`;
    const isEmpty = props.group.children.length === 0;
</script>

<template>
    <div class="d-flex">
        <IconList class="me-1">
            <IconListButton
                v-if="!isEmpty"
                title="Expand group"
                icon="bi-chevron-down"
                data-bs-toggle="collapse"
                class="me-1"
                :data-bs-target="target"
                :aria-controls="id"
                aria-expanded="false"
            />
            <IconListButton
                v-if="isEmpty"
                style="opacity: 0%"
                title="Expand group"
                icon="bi-chevron-down"
                data-bs-toggle="collapse"
                class="me-1"
                :data-bs-target="target"
                :aria-controls="id"
                aria-expanded="false"
            />
            <VisibilityControl
                :visible="isVisible"
                @update:visible="v => $emit('update:visible', group, v)"
            />
            <IconList class="text-body-tertiary">
                <i class="bi bi-folder2" title="Group" />
            </IconList>
        </IconList>
        <ListLabelButton
            class="label"
            :disabled="!isVisible || !hasLeafPreloaded"
            :text="group.name"
            :title="`Zoom to ${group.name}`"
            @click="$emit('zoom', group)"
        />
        <IconList class="ms-1">
            <div v-if="hasLeafPreloading" class="icon spinner d-inline-block">
                <SpinnerControl title="Loading..." />
            </div>
            <!-- TODO -->
            <!-- <IconListButton
                v-if="
                    hasLeafPreloaded &&
                    (group.config.canMaskBasemap || group.config.isMaskingBasemap)
                "
                title="Toggle basemap masking"
                icon="bi-mask"
                @click="$emit('update:toggle-mask', group)"
            />
            <IconListButton
                v-if="hasLeafPreloaded"
                title="Clip to"
                icon="bi-bounding-box"
                @click="$emit('clipTo', group)"
            />
            <IconListButton
                v-if="hasLeafPreloaded"
                title="Toggle 3D grid"
                icon="bi-box"
                @click="$emit('update:toggle-grid', group)"
            /> -->
        </IconList>
    </div>

    <CompactList :id="id" class="collapse">
        <template v-if="!isEmpty">
            <DatasetOrGroupItem
                v-for="dataset of group.children"
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
