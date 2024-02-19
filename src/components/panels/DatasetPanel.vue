<script setup lang="ts">
    import DatasetGroup from '@/components/panels/DatasetGroup.vue';
    import DropZone from '@/components/DropZone.vue';
    import BasemapItem from '@/components/panels/BasemapItem.vue';
    import OverlayItem from '@/components/panels/OverlayItem.vue';
    import SectionCollapsible from '@/components/atoms/SectionCollapsible.vue';
    import CompactList from '@/components/atoms/CompactList.vue';
    import { Dataset, DatasetType } from '@/types/Dataset';
    import { useAnalysisStore } from '@/stores/analysis';
    import { useDatasetStore } from '@/stores/datasets';
    import { useLayerStore } from '@/stores/layers';

    const datasets = useDatasetStore();
    const analysis = useAnalysisStore();
    const layers = useLayerStore();

    const groups: Record<DatasetType, string> = {
        ifc: 'IFC',
        pointcloud: 'Point clouds',
        cityjson: 'CityJSON',
        ply: 'PLY',
        shp: 'Shapefiles',
        geojson: 'GeoJSON',
        gpkg: 'Geopackages',
        bdtopo: '3D Buildings',
    } as const;

    function zoomOnDataset(dataset: Dataset) {
        datasets.goTo(dataset);
    }

    function clipToDataset(dataset: Dataset) {
        const entity = datasets.getEntity(dataset);
        if (!entity) return;
        const bbox = entity.getBoundingBox();
        if (!bbox || bbox.isEmpty()) return;

        analysis.setClippingBox(bbox);
        analysis.enableClippingBox(true);
    }

    async function importDatasetFromDrop(e: DragEvent) {
        const files = e.dataTransfer?.files;
        if (files) {
            for (const file of files) {
                datasets.importFromFile(file);
            }
        }
    }

    // async function importDatasetFromFile(e: Event) {
    //     const files = (e.target as HTMLInputElement).files;
    //     if (files) {
    //         for (const file of files) {
    //             datasets.importFromFile(file);
    //         }
    //     }
    // }

    // const hiddenInput = ref(null);

    defineEmits(['import']);
</script>

<template>
    <div class="d-flex flex-column h-100 overflow-auto">
        <DropZone id="datasets-drop-zone" @drop="importDatasetFromDrop" label="Import file..." />
        <SectionCollapsible
            title="Basemaps"
            icon-position="left"
            id="basemap-list"
            class="border-bottom mb-3"
        >
            <CompactList id="layers-list-group">
                <BasemapItem
                    v-for="layer in layers.getBasemaps()"
                    :key="layer.name"
                    :opacity="layer.opacity"
                    :name="layer.name"
                    :isLoading="layer.isLoading"
                    :visible="layer.visible"
                    :hasOpacitySlider="true"
                    @update:visible="v => layers.setBasemapVisibility(layer, v)"
                    @update:opacity="v => layers.setBasemapOpacity(layer, v)"
                /> </CompactList
        ></SectionCollapsible>
        <SectionCollapsible
            v-if="layers.overlayCount > 0"
            title="Overlays"
            icon-position="left"
            id="overlay-list"
            class="border-bottom mb-3"
        >
            <CompactList>
                <OverlayItem
                    v-for="layer in layers.getOverlays()"
                    :key="layer.name"
                    :opacity="layer.opacity"
                    :name="layer.name"
                    :visible="layer.visible"
                    @update:visible="v => layers.setOverlayVisibility(layer, v)"
                    @update:opacity="v => layers.setOverlayOpacity(layer, v)"
                    @update:move-up="layers.moveOverlayUp(layer)"
                    @update:move-down="layers.moveOverlayDown(layer)" /></CompactList
        ></SectionCollapsible>
        <SectionCollapsible
            title="Datasets"
            :expanded="true"
            icon-position="left"
            id="dataset-list"
            class="flex-fill"
        >
            <CompactList>
                <DatasetGroup
                    v-for="(name, type) in groups"
                    :key="type"
                    :group="name"
                    :datasets="datasets.getDatasets().filter(ds => ds.type === type)"
                    @zoom="zoomOnDataset"
                    @clipTo="clipToDataset"
                    @updated="$forceUpdate()"
                />
            </CompactList>
        </SectionCollapsible>
    </div>
    <!-- <div class="button-area">
    <ButtonWithIcon text="Add dataset..." @click="hiddenInput.click()" icon="bi-plus-lg" title="Add dataset from a local file"
      class="btn-primary" />
    <input ref="hiddenInput" class="btn btn-outline-secondary d-none" type="file" id="formFile"
      @input="importDatasetFromFile">
  </div> -->
</template>
