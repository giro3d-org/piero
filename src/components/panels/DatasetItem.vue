<script setup lang="ts">
    import { type Component } from 'vue';
    import SpinnerControl from '@/components/SpinnerControl.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';
    import IfcPropertyView from '@/components/panels/ifc/IfcPropertyView.vue';
    import ListLinkLabel from '@/components/atoms/ListLinkLabel.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import { Dataset, DatasetType } from '@/types/Dataset';
    import { refAndWatch } from '@/utils/Components';

    const props = defineProps<{
        dataset: Dataset;
    }>();

    const isLoading = refAndWatch(props.dataset, 'isLoading');

    defineEmits([
        'delete',
        'zoom',
        'clipTo',
        'update:visible',
        'update:toggle-grid',
        'update:toggle-mask',
    ]);

    const propertyViews: Map<DatasetType, Component> = new Map();
    propertyViews.set('ifc', IfcPropertyView);
</script>

<template>
    <li class="list-group-item">
        <div class="d-flex">
            <VisibilityControl
                :visible="dataset.visible"
                @update:visible="v => $emit('update:visible', v)"
            />
            <ListLinkLabel
                class="label"
                :class="!dataset.visible ? 'disabled' : null"
                href="#"
                :text="dataset.name"
                :title="`Zoom to ${dataset.name}`"
                @click="$emit('zoom')"
            />
            <IconList class="ms-1">
                <div class="icon spinner d-inline-block" v-if="isLoading">
                    <SpinnerControl title="Loading..." />
                </div>
                <IconListButton
                    v-if="dataset.type === 'ifc' && dataset.isLoaded"
                    title="Show dataset properties"
                    icon="bi-card-list"
                    data-bs-toggle="collapse"
                    :data-bs-target="`#collapse-${dataset.uuid}`"
                    :aria-controls="`collapse-${dataset.uuid}`"
                    aria-expanded="false"
                />
                <IconListButton
                    v-if="dataset.isLoaded && (dataset.canMaskBasemap || dataset.isMaskingBasemap)"
                    title="Toggle basemap masking"
                    icon="bi-mask"
                    @click="$emit('update:toggle-mask')"
                />
                <IconListButton
                    v-if="dataset.isLoaded"
                    title="Clip to"
                    icon="bi-bounding-box"
                    @click="$emit('clipTo')"
                />
                <IconListButton
                    v-if="dataset.isLoaded"
                    title="Toggle 3D grid"
                    icon="bi-box"
                    @click="$emit('update:toggle-grid')"
                />
                <IconListButton
                    title="Delete this dataset"
                    icon="bi-trash"
                    @click="$emit('delete')"
                />
            </IconList>
        </div>
        <!-- Property view -->
        <div
            v-if="propertyViews.has(dataset.type)"
            class="collapse m-2"
            :id="`collapse-${dataset.uuid}`"
        >
            <component :is="propertyViews.get(dataset.type)" :dataset="dataset"></component>
        </div>
    </li>
</template>

<style scoped>
    .label {
        min-width: 50%;
    }
</style>
