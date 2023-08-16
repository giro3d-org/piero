<script setup>
import Datasets from '../controllers/DatasetController'
import DatasetItem from './DatasetItem.vue'

const datasets = Datasets.getDatasets()

</script>

<template>
  <div>
    <h6>IFC</h6>
    <ul class="layers-list-group">
      <DatasetItem
        v-for="layer in datasets.filter(ds => ds.type === 'ifc')"
        :key="layer.name"
        :name="layer.name"
      />
    </ul>
    <hr>
    <h6>CityJSON</h6>
    <ul class="layers-list-group">
      <DatasetItem
      v-for="layer in datasets.filter(ds => ds.type === 'cityjson')"
        :key="layer.name"
        :name="layer.name"
      />
    </ul>
  </div>
</template>