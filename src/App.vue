<script setup>
import TheToolbar from './components/TheToolbar.vue'
import TheMinimap from './components/TheMinimap.vue'
import The3DView from './components/The3DView.vue'
import PanelItem from './components/PanelItem.vue'
import ProgressBar from './components/ProgressBar.vue'
</script>

<template>
  <The3DView class="view" />
  <TheToolbar class="component toolbar" />
  <TheMinimap class="component minimap"/>
  <PanelItem class="component panel" panel-name="Datasets" />
  <ProgressBar :percent="100" class="loading-indicator" />
</template>

<style scoped>
.component {
  background-color: var(--bs-body-bg);
  /* background: var(--color-background); */
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 1;
  background-color: transparent;
}

.panel {
  position: absolute;
  height: 100vh;
  left: 3.5rem;
  width: 30rem;
  z-index: 1;
}

.view {
  position: absolute;
  background-color: cadetblue;
  height: 100vh;
  left: 3.5rem;
  width: calc(100% - 3.5rem);
  z-index: 0;
}

.toolbar {
    width: 3.5rem;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
}

.minimap {
    width: 20rem;
    height: 10rem;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}
</style>
