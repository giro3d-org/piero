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
    <h6>Basemaps</h6>
    <ul id="basemap-list" class="layers-list-group">
      <BasemapItem
        v-for="layer in basemaps"
        :key="layer.name"
        :opacity="layer.opacity"
        :name="layer.name"
        :isLoading="layer.isLoading"
        :visible="layer.visible"
        :hasOpacitySlider="layer.type === 'color'"
        v-on:update:visible="() => { layer.visible = !layer.visible; $forceUpdate() }"
        v-on:update:opacity="(o) => { layer.opacity = o; $forceUpdate() }"
      />
    </ul>
    <hr>
    <h6>Overlays</h6>
    <ul id="overlay-list" class="layers-list-group">
      <OverlayItem
        v-for="item in overlays"
        :key="item.name"
        :name="item.name"
        :visible="item.visible"
        :opacity="item.opacity"
        v-on:update:visible="() => { item.visible = !item.visible; $forceUpdate() }"
        v-on:update:opacity="(o) => { item.opacity = o; $forceUpdate() }"
        v-on:update:move-up="() => { item.moveUp(); $forceUpdate() }"
        v-on:update:move-down="() => { item.moveDown(); $forceUpdate() }"
      />
    </ul>
  </div>
</template>