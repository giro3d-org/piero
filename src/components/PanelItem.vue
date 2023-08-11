<script setup>
import AboutPanel from './panels/AboutPanel.vue';
import BasemapPanel from './panels/BasemapPanel.vue'
import DatasetsPanel from './panels/DatasetsPanel.vue'
import SearchPanel from './panels/SearchPanel.vue';

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

panels.datasets = { name: 'Datasets' }
panels.basemaps = { name: 'Basemaps' }
panels.overlays = { name: 'Overlays' }
panels.annotations = { name: 'Annotations' }
panels.bookmarks = { name: 'Bookmarks' }
panels.analysis = { name: 'Analysis' }
panels.search = { name: 'Search' }
panels.about = { name: 'About' }
</script>

<template>
  <div class="panel">
    <h5 class="title">{{ panels[selected].name }}</h5>
    <div class="content">
      <DatasetsPanel v-if="selected === 'datasets'" />
      <BasemapPanel v-if="selected === 'basemaps'" />
      <AboutPanel v-if="selected === 'about'" />
      <SearchPanel v-if="selected === 'search'" />
    </div>
  </div>
</template>

<style scoped>
.title {
  margin: 1rem;
}

.content {
  width: 100% auto;
  margin: 1rem;
}

.panel {
  border-color: var(--bs-border-color);
  border-width: 0 2px 0 2px;
  border-style: solid;
}
</style>
