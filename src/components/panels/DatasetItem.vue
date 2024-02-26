<script setup lang="ts">
    import { type Component } from 'vue';
    import { Dataset, DatasetType } from '@/types/Dataset';
    import { useDatasetStore } from '@/stores/datasets';
    import { refAndWatch } from '@/utils/Components';
    import SpinnerControl from '@/components/SpinnerControl.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';
    import IfcPropertyView from '@/components/panels/ifc/IfcPropertyView.vue';
    import ListLabelButton from '@/components/atoms/ListLabelButton.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';

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

    const icons: Map<DatasetType, string> = new Map();
    icons.set('bdtopo', 'bi-buildings');
    icons.set('cityjson', 'bi-buildings');
    icons.set('geojson', 'fg-geojson-file');
    icons.set('gpkg', 'polygon-pt');
    icons.set('ifc', 'bi-building');
    icons.set('ply', 'bi-file-earmark-binary');
    icons.set('pointcloud', 'fg-multipoint');
    icons.set('shp', 'fg-shape-file');
</script>

<template>
    <div class="d-flex">
        <IconList class="me-1 text-body-tertiary">
            <i
                v-if="icons.get(dataset.type)?.startsWith('bi-')"
                class="bi"
                :class="icons.get(dataset.type)"
            />
            <i v-else-if="icons.get(dataset.type)" :class="icons.get(dataset.type)" />
            <i v-else class="bi bi-file-earmark-x" />
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
                    (dataset.get('canMaskBasemap') || dataset.get('isMaskingBasemap'))
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
