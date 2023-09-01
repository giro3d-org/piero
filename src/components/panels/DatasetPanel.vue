<script setup lang="ts">
import { ref } from 'vue';
import Dataset from '../../types/Dataset';
import IconButton from '../IconButton.vue';
import Datasets from '../controllers/DatasetController'
import DatasetGroup from './DatasetGroup.vue';

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

async function importDatasetFromFile(e: Event) {
  for (const file of (e.target as HTMLInputElement).files) {
    // TODO
    Datasets.importFromFile(file);
  }
}

const hiddenInput = ref(null);

defineEmits(['import'])
</script>

<template>
  <div>
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
