<script setup>
import BasemapPanel from './panels/BasemapPanel.vue'
import DatasetsPanel from './panels/DatasetsPanel.vue'

defineProps({
  /**
   * The name of the panel (must match the tooltip
   * of the corresponding tool in the toolbar)
   */
  selected: {
    type: String,
    required: true
  }
})

const panels = {}

panels.datasets = { name: 'Datasets', panel: DatasetsPanel }
panels.basemaps = { name: 'Basemaps', panel: BasemapPanel }
panels.overlays = { name: 'Overlays', panel: BasemapPanel }
panels.annotations = { name: 'Annotations', panel: BasemapPanel }
panels.bookmarks = { name: 'Bookmarks', panel: BasemapPanel }
panels.analysis = { name: 'Analysis', panel: DatasetsPanel }
panels.search = { name: 'Search', panel: DatasetsPanel }
panels.about = { name: 'About', panel: DatasetsPanel }
</script>

<template>
  <div class="panel">
    <h5 class="title">{{ panels[selected].name }}</h5>
    <div class="content">
      <DatasetsPanel v-if="selected === 'datasets'" />
      <BasemapPanel v-if="selected === 'basemaps'" />
    </div>
  </div>
</template>

<style scoped>
.title {
  margin: 1rem;
}

.content {
  background-color: red;
  width: 100% auto;
  margin: 1rem;
}

.panel {
  border-color: var(--bs-border-color);
  border-width: 0 2px 0 2px;
  border-style: solid;
}
</style>
