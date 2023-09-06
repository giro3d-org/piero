<script setup>
import Basemaps from '../controllers/BasemapController'
import BasemapItem from './BasemapItem.vue';
import Overlays from '../controllers/OverlayController'
import OverlayItem from './OverlayItem.vue'

const basemaps = Basemaps.getBasemaps()
const overlays = Overlays.getOverlays()

</script>

<template>
  <div class="py-2">
    <div id="basemap-list">
      <h6>Basemaps</h6>
      <ul class="layers-list-group">
        <BasemapItem v-for="layer in basemaps"
          :key="layer.name"
          :opacity="layer.opacity"
          :name="layer.name"
          :isLoading="layer.isLoading"
          :visible="layer.visible"
          :hasOpacitySlider="layer.type === 'color'"
          v-on:update:visible="() => { layer.visible = !layer.visible; $forceUpdate() }"
          v-on:update:opacity="(o) => { layer.opacity = o; $forceUpdate() }" />
      </ul>
    </div>
    <hr>
    <div id="overlay-list">

      <h6>Overlays</h6>
      <ul class="layers-list-group">
        <OverlayItem v-for="item in overlays"
          :key="item.name"
          :opacity="item.opacity"
          :name="item.name"
          :visible="item.visible"
          v-on:update:visible="() => { item.visible = !item.visible; $forceUpdate() }"
          v-on:update:opacity="(o) => { item.opacity = o; $forceUpdate() }"
          v-on:update:move-up="() => { item.moveUp(); $forceUpdate() }"
          v-on:update:move-down="() => { item.moveDown(); $forceUpdate() }" />
      </ul>
    </div>
  </div>
</template>