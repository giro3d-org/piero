<script setup>
import BasemapItem from './BasemapItem.vue';
import OverlayItem from './OverlayItem.vue'
import { useLayerStore } from '@/stores/layers';

const layers = useLayerStore();

</script>

<template>
  <div class="py-2">
    <div id="basemap-list">
      <h6>Basemaps</h6>
      <ul class="layers-list-group">
        <BasemapItem v-for="layer in layers.getBasemaps()"
          :key="layer.name"
          :opacity="layer.opacity"
          :name="layer.name"
          :isLoading="layer.isLoading"
          :visible="layer.visible"
          :hasOpacitySlider="layer.type === 'color'"
          v-on:update:visible="v => layers.setBasemapVisibility(layer, v)"
          v-on:update:opacity="v => layers.setBasemapOpacity(layer, v)" />
      </ul>
    </div>
    <hr>
    <div id="overlay-list">
      <h6>Overlays</h6>
      <ul class="layers-list-group">
        <OverlayItem v-for="layer in layers.getOverlays()"
          :key="layer.name"
          :opacity="layer.opacity"
          :name="layer.name"
          :visible="layer.visible"
          v-on:update:visible="v => layers.setOverlayVisibility(layer, v)"
          v-on:update:opacity="v => layers.setOverlayOpacity(layer, v)"
          v-on:update:move-up="layers.moveOverlayUp(layer)"
          v-on:update:move-down="layers.moveOverlayDown(layer)" />
      </ul>
    </div>
  </div>
</template>