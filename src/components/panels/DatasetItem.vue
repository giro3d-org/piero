<script setup lang="ts">
    import SpinnerControl from '@/components/SpinnerControl.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';
    import Icon from '@/components/atoms/Icon.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import ListLabelButton from '@/components/atoms/ListLabelButton.vue';
    import IfcPropertyView from '@/components/panels/ifc/IfcPropertyView.vue';
    import { useDatasetStore } from '@/stores/datasets';
    import type { Dataset } from '@/types/Dataset';
    import type { DatasetType } from '@/types/configuration/datasets';
    import { refAndWatch } from '@/utils/Components';
    import { type Component } from 'vue';

    const store = useDatasetStore();

    const props = defineProps<{
        dataset: Dataset;
    }>();

    defineEmits(['zoom', 'clipTo', 'update:toggle-grid', 'update:toggle-mask', 'update:visible']);

    const isPreloading = refAndWatch(props.dataset, 'isPreloading');
    const isPreloaded = refAndWatch(props.dataset, 'isPreloaded');
    const isVisible = refAndWatch(props.dataset, 'visible');

    function deleteDataset() {
        store.remove(props.dataset);
    }

    const propertyViews: Map<DatasetType, Component> = new Map();
    propertyViews.set('ifc', IfcPropertyView);

    const icons: Record<DatasetType, string> = {
        featureCollection: 'bi-buildings',
        cityjson: 'bi-buildings',
        colorLayer: 'fg-landcover-map',
        elevationLayer: 'fg-contour-map',
        flatPointcloud: 'fg-multipoint',
        ifc: 'bi-building',
        maskLayer: 'fg-hex-map',
        ply: 'bi-file-earmark-binary',
        pointcloud: 'fg-multipoint',
        potree: 'fg-multipoint',
        tiledIfc: 'bi-building',
        vector: 'fg-polygon-pt',
    };

    const iconTitles: Record<DatasetType, string> = {
        featureCollection: 'Feature Collection',
        cityjson: 'CityJSON',
        colorLayer: 'Color Layer',
        elevationLayer: 'Elevation layer',
        flatPointcloud: 'Point Cloud',
        ifc: 'IFC',
        maskLayer: 'Mask Layer',
        ply: 'PLY',
        pointcloud: 'Point Cloud',
        potree: 'Potree Point Cloud',
        tiledIfc: 'IFC',
        vector: 'Vector',
    };
</script>

<template>
    <div class="d-flex">
        <IconList class="me-1 text-body-tertiary">
            <Icon
                :icon="icons[dataset.type] ?? 'bi-file-earmark-x'"
                :title="iconTitles[dataset.type] ?? 'Unknown'"
            />
        </IconList>
        <VisibilityControl
            :visible="isVisible"
            @update:visible="v => $emit('update:visible', dataset, v)"
        />
        <ListLabelButton
            class="label"
            :disabled="!isVisible || !isPreloaded"
            :text="dataset.name"
            :title="`Zoom to ${dataset.name}`"
            @click="$emit('zoom', dataset)"
        />
        <IconList class="ms-1">
            <div v-if="isPreloading" class="icon spinner d-inline-block">
                <SpinnerControl title="Loading..." />
            </div>
            <IconListButton
                v-if="dataset.type === 'ifc' && isPreloaded"
                title="Show dataset properties"
                icon="bi-card-list"
                data-bs-toggle="collapse"
                :data-bs-target="`#collapse-${dataset.uuid}`"
                :aria-controls="`collapse-${dataset.uuid}`"
                aria-expanded="false"
            />
            <IconListButton
                v-if="
                    isPreloaded &&
                    (('canMaskBasemap' in dataset.config && dataset.config.canMaskBasemap) ||
                        ('isMaskingBasemap' in dataset.config && dataset.config.isMaskingBasemap))
                "
                title="Toggle basemap masking"
                icon="bi-mask"
                @click="$emit('update:toggle-mask', dataset)"
            />
            <IconListButton
                v-if="isPreloaded"
                title="Clip to"
                icon="bi-bounding-box"
                @click="$emit('clipTo', dataset)"
            />
            <IconListButton
                v-if="isPreloaded"
                title="Toggle 3D grid"
                icon="bi-box"
                @click="$emit('update:toggle-grid', dataset)"
            />
            <IconListButton title="Delete this dataset" icon="bi-trash" @click="deleteDataset" />
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
</template>

<style scoped>
    .label {
        min-width: 50%;
    }
</style>
