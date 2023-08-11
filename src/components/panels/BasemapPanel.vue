<script setup>
import { getBasemaps } from '../../controllers/BasemapController'
import BasemapItem from './BasemapItem.vue'
import Basemap from '../../types/Basemap'

const basemaps = getBasemaps()

</script>

<template>
  <div>
    <ul id="basemap-list" class="layers-list-group">
      <BasemapItem
        v-for="layer in basemaps"
        :key="layer.name"
        :opacity="layer.opacity"
        :name="layer.name"
        :isLoading="layer.isLoading"
        :visible="layer.visible"
        v-on:update:visible="() => { layer.visible = !layer.visible; $forceUpdate() }"
        v-on:update:opacity="(o) => { layer.opacity = o; $forceUpdate() }"
      />
    </ul>
  </div>
</template>
