<script setup lang="ts">
import Dataset from '../../types/Dataset';
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
</script>

<template>
  <div>
    <DatasetGroup v-for="(item, index) in groups" :key="index" :group="item.name" @zoom="(ds) => zoomOnDataset(ds)"
      :datasets="datasets.filter((ds) => ds.type === item.key)"
      @updated="$forceUpdate()" />
  </div>
</template>
