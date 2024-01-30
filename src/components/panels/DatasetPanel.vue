<script setup lang="ts">
import { useDatasetStore } from '../../stores/datasets';
import { Dataset, DatasetType } from '@/types/Dataset';
import DatasetGroup from './DatasetGroup.vue';
import DropZone from '../DropZone.vue';
import { useAnalysisStore } from '@/stores/analysis';

const datasets = useDatasetStore();
const analysis = useAnalysisStore();

const groups: Record<DatasetType, string> = {
    'ifc': 'IFC',
    'pointcloud': 'Point clouds',
    'cityjson': 'CityJSON',
    'ply': 'PLY',
    'shp': 'Shapefiles',
    'geojson': 'GeoJSON',
    'gpkg': 'Geopackages',
    'bdtopo': '3D Buildings',
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

defineEmits(['import'])
</script>

<template>
    <div class="d-flex flex-column h-100">
        <DropZone id="datasets-drop-zone" @drop="importDatasetFromDrop" label="Import file..." />
        <div class="flex-fill overflow-auto">
            <DatasetGroup v-for="(name, type) in groups" :key="type" :group="name"
                :datasets="datasets.getDatasets().filter(ds => ds.type === type)" @zoom="zoomOnDataset"
                @clipTo="clipToDataset" @updated="$forceUpdate()" />
        </div>
    </div>
    <!-- <div class="button-area">
    <IconButton text="Add dataset..." @click="hiddenInput.click()" icon="bi-plus-lg" title="Add dataset from a local file"
      class="btn-primary" />
    <input ref="hiddenInput" class="btn btn-outline-secondary d-none" type="file" id="formFile"
      @input="importDatasetFromFile">
  </div> -->
</template>

<style scoped>
button {
    margin-top: 0.2rem;
    width: 100%;
}
</style>
