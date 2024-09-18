<script setup lang="ts">
    import { type Component } from 'vue';
    import { useDatasetStore } from '@/stores/datasets';
    import type { DatasetType } from '@/types/configuration/datasets';
    import type { Dataset } from '@/types/Dataset';
    import { refAndWatch } from '@/utils/Components';
    import Icon from '@/components/atoms/Icon.vue';
    import IconList from '@/components/atoms/IconList.vue';
    import IconListButton from '@/components/atoms/IconListButton.vue';
    import IfcPropertyView from '@/components/panels/ifc/IfcPropertyView.vue';
    import ListLabelButton from '@/components/atoms/ListLabelButton.vue';
    import SpinnerControl from '@/components/SpinnerControl.vue';
    import VisibilityControl from '@/components/VisibilityControl.vue';

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
        'pointcloud-csv': 'fg-multipoint',
        'vector-tile': 'fg-contour-map',
        bdtopo: 'bi-buildings',
        cityjson: 'bi-buildings',
        cog: 'fg-contour-map',
        geojson: 'fg-geojson-file',
        gpkg: 'fg-polygon-pt',
        gpx: 'fg-polyline',
        ifc: 'bi-building',
        kml: 'fg-polygon-pt',
        las: 'fg-multipoint',
        mvt: 'fg-contour-map',
        ply: 'bi-file-earmark-binary',
        pointcloud: 'fg-multipoint',
        potree: 'fg-multipoint',
        shp: 'fg-shape-file',
        vector: 'fg-polygon-pt',
        wms: 'fg-contour-map',
        wmts: 'fg-contour-map',
        xyz: 'fg-contour-map',
    };

    const iconTitles: Record<DatasetType, string> = {
        'pointcloud-csv': 'CSV Point Cloud',
        'vector-tile': 'Vector tile',
        bdtopo: 'BDTopo',
        cityjson: 'CityJSON',
        cog: 'COG',
        geojson: 'GeoJSON',
        gpkg: 'Geopackage',
        gpx: 'GPX',
        ifc: 'IFC',
        kml: 'KML',
        las: 'LAS Point Cloud',
        mvt: 'MVT',
        ply: 'PLY',
        pointcloud: 'Point Cloud',
        potree: 'Potree Point Cloud',
        shp: 'Shapefile',
        vector: 'Vector',
        wms: 'WMS',
        wmts: 'WMTS',
        xyz: 'XYZ',
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
