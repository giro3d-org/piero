<script setup>
import AboutPanel from './panels/AboutPanel.vue';
import BasemapPanel from './panels/BasemapPanel.vue'
import DatasetPanel from './panels/DatasetPanel.vue'
import SearchPanel from './panels/SearchPanel.vue';
import BookmarkPanel from './panels/BookmarkPanel.vue';
import OverlayPanel from './panels/OverlayPanel.vue';
import AnalysisPanel from './panels/AnalysisPanel.vue';
import AnnotationPanel from './panels/AnnotationPanel.vue';

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
      <DatasetPanel v-if="selected === 'datasets'" />
      <BasemapPanel v-if="selected === 'basemaps'" />
      <AboutPanel v-if="selected === 'about'" />
      <SearchPanel v-if="selected === 'search'" />
      <BookmarkPanel v-if="selected === 'bookmarks'" />
      <OverlayPanel v-if="selected === 'overlays'" />
      <AnalysisPanel v-if="selected === 'analysis'" />
      <AnnotationPanel v-if="selected === 'annotations'" />
    </div>
  </div>
</template>

<style scoped>
.title {
  margin: 1rem;
}

.content {
  width: 100% auto;
  /* height: 100%; */
  margin: 1rem;
}

.panel {
  border-color: var(--bs-border-color);
  border-width: 0 2px 0 2px;
  border-style: solid;
}
</style>
