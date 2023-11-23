<script setup lang="ts">
import { ref } from 'vue';
import { useDatasetStore } from '../../stores/datasets';
import { Dataset } from '@/types/Dataset';
import DatasetGroup from './DatasetGroup.vue';
import DropZone from '../DropZone.vue';
import { useAnalysisStore } from '@/stores/analysis';

const datasets = useDatasetStore();
const analysis = useAnalysisStore();

const groups = [
  { key: 'ifc', name: 'IFC' },
  { key: 'pointcloud', name: 'Point clouds' },
  { key: 'cityjson', name: 'CityJSON' },
  { key: 'bdtopo', name: '3D Buildings' },
]

function zoomOnDataset(dataset: Dataset) {
  datasets.goTo(dataset);
}

function clipToDataset(dataset: Dataset) {
    const entity = datasets.getEntity(dataset);
    const bbox = entity.getBoundingBox();
    analysis.setClippingBox(bbox);
    analysis.enableClippingBox(true);
}

async function importDatasetFromDrop(e: DragEvent) {
  for (const file of e.dataTransfer.files) {
    datasets.importFromFile(file);
  }
}

async function importDatasetFromFile(e: Event) {
  for (const file of (e.target as HTMLInputElement).files) {
    datasets.importFromFile(file);
  }
}

const hiddenInput = ref(null);

defineEmits(['import'])
</script>

<template>
  <div class="root">
    <DropZone id="datasets-drop-zone" @drop="importDatasetFromDrop" label="Import file..." />
    <DatasetGroup v-for="(item, index) in groups"
      :key="index"
      :group="item.name"
      :datasets="datasets.getDatasets().filter(ds => ds.type === item.key)"
      @zoom="zoomOnDataset"
      @clipTo="clipToDataset"
      @updated="$forceUpdate()"
    />
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

.root {
  max-height: 100%;
}
</style>
