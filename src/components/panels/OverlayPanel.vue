<script setup>
import Overlays from '../controllers/OverlayController'
import OverlayItem from './OverlayItem.vue'

const overlays = Overlays.getOverlays()

</script>

<template>
  <div>
    <ul class="layers-list-group">
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