<script setup>
import TheToolbar from './components/toolbar/TheToolbar.vue'
import MinimapView from './components/MinimapView.vue'
import MainView from './components/MainView.vue'
import PanelContainer from './components/PanelContainer.vue'
import ProgressBar from './components/ProgressBar.vue'
import Giro3DController from './components/controllers/Giro3DController.js'
import SearchOverlay from './components/SearchOverlay.vue'
import { ref } from 'vue'
import StatusBar from './components/StatusBar.vue'

const selectedTool = ref(null);
const progress = ref(1);
const coordinates = ref({ x: 0, y: 0, z: 0 });

function selectPanel(key) {
  if (key === selectedTool.value) {
    selectedTool.value = null;
  } else {
    selectedTool.value = key;
  }
}

Giro3DController.registerCallback(() => {
  progress.value = Giro3DController.getProgress();
});

function pick(event) {
  const picks = Giro3DController.getMainInstance().pickObjectsAt(event, {
    radius: 1,
    limit: 1
  });

  if (picks.length > 0) {
    const point = picks[0].point;
    coordinates.value.x = point.x;
    coordinates.value.y = point.y;
    coordinates.value.z = point.z;
  }
}

</script>

<template>
  <MainView @mousemove="(evt) => pick(evt)" class="mainview" />
  <StatusBar class="component statusbar" :x="coordinates.x" :y="coordinates.y" :z="coordinates.z"/>
  <TheToolbar :active="selectedTool" class="component toolbar" v-on:selected="v => selectPanel(v)" />
  <MinimapView class="component minimap" />
  <PanelContainer v-if="selectedTool != null" class="component panel" :selected="selectedTool" />
  <ProgressBar :progress="progress" class="loading-indicator" />
  <SearchOverlay class="search" />
</template>

<style scoped>
.component {
  background-color: var(--bs-body-bg);
}

.statusbar {
  padding: 0.2rem;
  text-align: center;
  border-top-left-radius: 0.5rem;
  box-shadow: -1px -1px 5px rgba(0, 0, 0, 0.1);
  height: 1.5rem;
  position: absolute;
  bottom: 0;
  right: 0;
}

.search {
  position: absolute;
  top: 0;
  left: calc(50% - 20rem / 2);
  width: 20rem;
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
  width: 25rem;
  z-index: 1;
}

.mainview {
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
  width: 10rem;
  height: 10rem;
  position: absolute;
  margin: 0.5rem;
  top: 0;
  right: 0;
}
</style>
