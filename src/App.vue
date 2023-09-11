<script setup lang="ts">
import ToolBar from './components/toolbar/ToolBar.vue'
import MinimapView from './components/MinimapView.vue'
import MainView from './components/MainView.vue'
import ProgressBar from './components/ProgressBar.vue'
import SearchOverlay from './components/SearchOverlay.vue'
import { defineAsyncComponent, ref } from 'vue'
import StatusBar from './components/StatusBar.vue'
import Giro3DManager from '@/services/Giro3DManager'
import Tour from '@/services/Tour'
import AlertToast from './components/AlertToast.vue'
import Feature from './types/Feature'
import Picker from '@/services/Picker'
import { Vector3 } from 'three'

const AttributePanel = defineAsyncComponent(() => import('./components/AttributePanel.vue'));
const PanelContainer = defineAsyncComponent(() => import('./components/PanelContainer.vue'));

const selectedTool = ref(null);
const progress = ref(1);
const coordinates = ref(new Vector3(0, 0, 0));
const picker = new Picker();
const mouse = ref({ x: 0, y: 0});
const pickedFeature = ref<Feature>(null);
const tooltip = ref<string>(null);
const isLoading = ref(false);

function selectPanel(key: string) {
  if (key === selectedTool.value) {
    selectedTool.value = null;
  } else {
    selectedTool.value = key;
  }
}

let giro3d: Giro3DManager;

function onGiro3DMounted(main: Giro3DManager) {
  giro3d = main;
  giro3d.addEventListener('update', () => {
    progress.value = giro3d.mainInstance.progress;
    isLoading.value = giro3d.mainInstance.loading;
  })

  Tour.start(giro3d.mainInstance, null, giro3d.camera, null);
}

function pick(event: MouseEvent, clicked?: boolean) {
  if (!giro3d) {
    return;
  }
  mouse.value = { x: event.clientX, y: event.clientY };

  const instance = giro3d?.mainInstance;

  if (!instance) {
    return;
  }

  const picked = picker.pick(giro3d.mainInstance, event);

  if (picked?.point) {
    const point = picked.point;
    coordinates.value.x = point.x;
    coordinates.value.y = point.y;
    coordinates.value.z = point.z;
  }

  if (picked?.feature) {
    tooltip.value = picked.feature.name;
    if (clicked) {
      pickedFeature.value = picked.feature;
    }
  } else {
    tooltip.value = null;
    if (clicked) {
      pickedFeature.value = null;
    }
  }
}

function updateCoordinates(event: MouseEvent) {
  if (giro3d) {
    const point = picker.getMouseCoordinate(giro3d.mainInstance, event);

    if (point) {
      coordinates.value.x = point.x;
      coordinates.value.y = point.y;
      coordinates.value.z = point.z;
    }
  }
}

</script>

<template>
  <MainView id="main-view" @main-controller="ctrl => onGiro3DMounted(ctrl)" @click="(evt) => pick(evt, true)" @mousemove="(evt) => updateCoordinates(evt)" class="mainview" />
  <AttributePanel v-if="pickedFeature != null" @close="pickedFeature = null" :attributelist="pickedFeature.attributes" :name="pickedFeature.name" :parent="pickedFeature.parent" class="component attribute-panel" />
  <StatusBar class="component statusbar" :x="coordinates.x" :y="coordinates.y" :z="coordinates.z"/>
  <ToolBar id="toolbar" :active="selectedTool" class="component toolbar" v-on:selected="v => selectPanel(v)" />
  <MinimapView class="component minimap" />
  <PanelContainer v-if="selectedTool != null" class="component panel" :selected="selectedTool" />
  <ProgressBar :progress="progress" class="loading-indicator" />
  <SearchOverlay id="address-search" class="search" />
  <AlertToast />
</template>

<style scoped>
.component {
  background-color: var(--bs-body-bg);
}

.attribute-panel {
  position: absolute;
  box-shadow: -1px -1px 5px rgba(0, 0, 0, 0.5);
  border-style: sol;
  right: 0;
  bottom: 0;
  width: 370px;
  max-height: 60%;
  margin-right: 1rem;
  margin-bottom: 3rem;
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
  width: 27rem;
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
@/services/Giro3DManager@/services/Tour@/services/Picker