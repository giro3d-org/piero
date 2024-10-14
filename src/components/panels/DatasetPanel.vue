<script setup lang="ts">
    import ButtonArea from '@/components/atoms/ButtonArea.vue';
    import CompactList from '@/components/atoms/CompactList.vue';
    import ImportButton from '@/components/atoms/ImportButton.vue';
    import SectionCollapsible from '@/components/atoms/SectionCollapsible.vue';
    import BasemapItem from '@/components/panels/BasemapItem.vue';
    import DatasetOrGroupItem from '@/components/panels/DatasetOrGroupItem.vue';
    import OverlayItem from '@/components/panels/OverlayItem.vue';
    import { useAnalysisStore } from '@/stores/analysis';
    import { useCameraStore } from '@/stores/camera';
    import { useDatasetStore } from '@/stores/datasets';
    import { useLayerStore } from '@/stores/layers';
    import type { DatasetOrGroup } from '@/types/Dataset';

    const datasets = useDatasetStore();
    const camera = useCameraStore();
    const analysis = useAnalysisStore();
    const layers = useLayerStore();

    function zoomOnDataset(dataset: DatasetOrGroup) {
        const box = datasets.getBoundingBox(dataset);
        if (!box?.isEmpty()) {
            camera.lookTopDownAt(box);
        }
    }

    function clipToDataset(dataset: DatasetOrGroup) {
        const box = datasets.getBoundingBox(dataset);
        if (!box?.isEmpty()) {
            analysis.setClippingBox(box);
            analysis.enableClippingBox(true);
        }
    }

    async function importDataset(files: File[]) {
        for (const file of files) {
            datasets.importFromFile(file);
        }
    }
</script>

<template>
    <div class="d-flex flex-column h-100">
        <div class="flex-fill overflow-auto">
            <SectionCollapsible
                title="Basemaps"
                icon-position="left"
                id="basemap-list"
                class="border-bottom mb-3"
            >
                <CompactList id="layers-list-group">
                    <BasemapItem
                        v-if="layers.getGraticuleLayer() !== undefined"
                        type="graticule"
                        :opacity="1"
                        :name="layers.getGraticuleLayer()!.name"
                        :isLoading="false"
                        :visible="layers.getGraticuleLayer()!.visible"
                        :hasOpacitySlider="false"
                        @update:visible="v => (layers.getGraticuleLayer()!.visible = v)"
                    />

                    <BasemapItem
                        v-for="layer in layers.getBasemaps()"
                        :key="layer.name"
                        :type="layer.type"
                        :opacity="layer.opacity"
                        :name="layer.name"
                        :isLoading="layer.isLoading"
                        :visible="layer.visible"
                        :hasOpacitySlider="layer.type === 'color' || layer.type === 'elevation'"
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
            >
                <CompactList>
                    <DatasetOrGroupItem
                        v-for="dataset of datasets.getTree()"
                        :key="dataset.name"
                        :dataset="dataset"
                        @updated="$forceUpdate()"
                        @zoom="ds => zoomOnDataset(ds)"
                        @clip-to="ds => clipToDataset(ds)"
                        @update:toggle-grid="ds => datasets.toggleGrid(ds)"
                        @update:toggle-mask="ds => datasets.toggleMask(ds)"
                        @update:visible="(ds, v) => datasets.setVisible(ds, v)"
                    />
                </CompactList>
            </SectionCollapsible>
        </div>

        <ButtonArea>
            <ImportButton title="Import file" text="Import file" @import="importDataset" />
        </ButtonArea>
    </div>
</template>
