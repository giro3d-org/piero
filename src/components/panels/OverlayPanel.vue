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
      />
    </ul>
  </div>
</template>