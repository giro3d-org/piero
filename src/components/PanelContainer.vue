<script setup>
import { defineAsyncComponent } from 'vue';
import Configuration from './Configuration';

const DatasetPanel = defineAsyncComponent(() => import('./panels/DatasetPanel.vue'));
const AboutPanel = defineAsyncComponent(() => import('./panels/AboutPanel.vue'));
const BookmarkPanel = defineAsyncComponent(() => import('./panels/BookmarkPanel.vue'));
const LayerPanel = defineAsyncComponent(() => import('./panels/LayerPanel.vue'));
const AnalysisPanel = defineAsyncComponent(() => import('./panels/AnalysisPanel.vue'));
const AnnotationPanel = defineAsyncComponent(() => import('./panels/AnnotationPanel.vue'));

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

defineEmits(['restart-tour'])

const panels = Configuration.panels;
</script>

<template>
  <div class="panel" id="panel-container">
    <h5 class="title">{{ panels.find(p => p.key === selected).title }}</h5>
    <div class="content">
      <DatasetPanel v-if="selected === 'datasets'" />
      <AboutPanel v-if="selected === 'about'" @restart-tour="$emit('restart-tour')" />
      <BookmarkPanel v-if="selected === 'bookmarks'" />
      <LayerPanel v-if="selected === 'layers'" />
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
