<script setup>
import TheToolbar from './components/toolbar/TheToolbar.vue'
import TheMinimap from './components/TheMinimap.vue'
import The3DView from './components/The3DView.vue'
import PanelContainer from './components/PanelContainer.vue'
import ProgressBar from './components/ProgressBar.vue'
import Giro3DController from './components/controllers/Giro3DController.js'
import SearchOverlay from './components/SearchOverlay.vue'

let selectedTool = 'datasets';

function toggleSelectedTool(key) {
  if (key === selectedTool) {
      selectedTool = null;
    } else {
      selectedTool = key;
    }
}

</script>

<template>
  <The3DView class="view" />
  <TheToolbar :active="selectedTool" class="component toolbar" v-on:selected="v => {
    toggleSelectedTool(v)
    $forceUpdate()
  }" />
  <TheMinimap class="component minimap" />
  <PanelContainer  v-if="selectedTool != null" class="component panel" :selected="selectedTool" />
  <ProgressBar :progress="Giro3DController.getProgress()" class="loading-indicator" />
  <SearchOverlay class="search"/>
</template>

<style scoped>
.component {
  background-color: var(--bs-body-bg);
  /* background: var(--color-background); */
}

.search {
  position: absolute;
  top: 0;
  right: 0;
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
  width: 20rem;
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
  background-color: rgb(250, 250, 250);
  top: 0;
  left: 0;
}

.minimap {
  width: 15rem;
  height: 10rem;
  position: absolute;
  margin: 0.5rem;
  bottom: 0;
  right: 0;
}
</style>
