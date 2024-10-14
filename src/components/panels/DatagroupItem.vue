<script setup lang="ts">
    import SpinnerControl from '@/components/SpinnerControl.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';
    import CompactList from '@/components/atoms/CompactList.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import ListLabelButton from '@/components/atoms/ListLabelButton.vue';
    import DatasetOrGroupItem from '@/components/panels/DatasetOrGroupItem.vue';
    import type { Datagroup } from '@/types/Dataset';
    import { MathUtils } from 'three';
    import { reactive, ref, watch } from 'vue';

    const props = defineProps<{
        group: Datagroup;
    }>();

    defineEmits(['zoom', 'clipTo', 'update:toggle-grid', 'update:toggle-mask', 'update:visible']);

    const leafs = reactive(props.group.leafs());
    const hasLeafPreloading = ref(false);
    const hasLeafPreloaded = ref(false);
    const isVisible = ref(props.group.visible);
    watch(leafs, newValues => {
        hasLeafPreloading.value = newValues.some(v => v.isPreloading);
        hasLeafPreloaded.value = newValues.some(v => v.isPreloaded);
        isVisible.value = newValues.some(v => v.visible);
    });

    const id = MathUtils.generateUUID();
    const target = `#${id}`;
</script>

<template>
    <div class="d-flex">
        <IconList class="me-1 text-body-tertiary">
            <i class="bi bi-folder2" title="Group" />
        </IconList>
        <VisibilityControl
            :visible="isVisible"
            @update:visible="v => $emit('update:visible', group, v)"
        />
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
            <IconListButton
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
            />
        </IconList>
    </div>

    <CompactList :id="id" class="collapse pb-3">
        <template v-if="group.children.length > 0">
            <DatasetOrGroupItem
                v-for="dataset of group.children"
                :key="dataset.name"
                :dataset="dataset"
                @zoom="ds => $emit('zoom', ds)"
                @clip-to="ds => $emit('clipTo', ds)"
                @update:toggle-grid="ds => $emit('update:toggle-grid', ds)"
                @update:toggle-mask="ds => $emit('update:toggle-mask', ds)"
                @update:visible="(ds, v) => $emit('update:visible', ds, v)"
            />
        </template>
        <template v-else>
            <li class="list-group-item">No dataset in this group</li>
        </template>
    </CompactList>
</template>

<style scoped>
    .label {
        min-width: 50%;
    }
</style>
