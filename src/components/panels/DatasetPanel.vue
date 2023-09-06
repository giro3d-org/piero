<script setup lang="ts">
import { ref } from 'vue';
import Dataset from '../../types/Dataset';
import IconButton from '../IconButton.vue';
import Datasets from '../controllers/DatasetController'
import DatasetGroup from './DatasetGroup.vue';
import DropZone from '../DropZone.vue';

const datasets = Datasets.getDatasets();

const groups = [
  { key: 'ifc', name: 'IFC' },
  { key: 'lidarhd', name: 'Lidar HD' },
  { key: 'cityjson', name: 'CityJSON' },
  { key: 'bdtopo', name: '3D Buildings' },
]

function zoomOnDataset(dataset: Dataset) {
  Datasets.zoomOn(dataset);
}

async function importDatasetFromDrop(e: DragEvent) {
  for (const file of e.dataTransfer.files) {
    Datasets.importFromFile(file);
  }
}

async function importDatasetFromFile(e: Event) {
  for (const file of (e.target as HTMLInputElement).files) {
    Datasets.importFromFile(file);
  }
}

const hiddenInput = ref(null);

defineEmits(['import'])
</script>

<template>
  <div>
    <DropZone @drop="importDatasetFromDrop" label="Import file..." />
    <DatasetGroup v-for="(item, index) in groups" :key="index" :group="item.name" @zoom="zoomOnDataset"
      :datasets="datasets.filter((ds) => ds.type === item.key)" @updated="$forceUpdate()" />
  </div>
  <div class="button-area">
    <!-- Import from GeoJSON -->
    <IconButton text="Add dataset..." @click="hiddenInput.click()" icon="bi-plus-lg" title="Add dataset from a local file"
      class="btn-primary" />
    <input ref="hiddenInput" class="btn btn-outline-secondary d-none" type="file" id="formFile"
      @input="importDatasetFromFile">
  </div>
</template>

<style scoped>
button {
  margin-top: 0.2rem;
  width: 100%;
}
</style>
