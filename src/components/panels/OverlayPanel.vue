<script setup>
import Datasets from '../controllers/DatasetController'
import OverlayItem from './OverlayItem.vue'

const datasets = Datasets.getDatasets()

</script>

<template>
  <div>
    <ul class="layers-list-group">
      <OverlayItem
        v-for="layer in datasets"
        :key="layer.name"
        :name="layer.name"
      />
    </ul>
  </div>
</template>