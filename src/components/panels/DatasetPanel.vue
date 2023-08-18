<script setup lang="ts">
import Datasets from '../controllers/DatasetController'
import DatasetItem from './DatasetItem.vue'

const datasets = Datasets.getDatasets()
</script>

<template>
  <div>
    <h6>IFC</h6>
    <ul class="layers-list-group">
      <DatasetItem
        v-for="layer in datasets.filter((ds) => ds.type === 'ifc')"
        :key="layer.name"
        :name="layer.name"
        :visible="layer.visible"
        v-on:update:visible="(v) => { layer.visible = !layer.visible; $forceUpdate() }"
      />
    </ul>

    <hr />
    <h6>Lidar HD</h6>
    <ul class="layers-list-group">
      <DatasetItem
        v-for="layer in datasets.filter((ds) => ds.type === 'lidarhd')"
        :key="layer.name"
        :name="layer.name"
        :visible="layer.visible"
        v-on:update:visible="(v) => { layer.visible = !layer.visible; $forceUpdate() }"
      />
    </ul>

    <hr />
    <h6>CityJSON</h6>
    <ul class="layers-list-group">
      <DatasetItem
        v-for="layer in datasets.filter((ds) => ds.type === 'cityjson')"
        :key="layer.name"
        :name="layer.name"
        :visible="layer.visible"
        v-on:update:visible="(v) => { layer.visible = !layer.visible; $forceUpdate() }"
      />
    </ul>
  </div>
</template>
