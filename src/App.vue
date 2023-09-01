<script setup lang="ts">
import TheToolbar from './components/toolbar/TheToolbar.vue'
import { Feature as OLFeature } from 'ol'
import MinimapView from './components/MinimapView.vue'
import MainView from './components/MainView.vue'
import PanelContainer from './components/PanelContainer.vue'
import ProgressBar from './components/ProgressBar.vue'
import SearchOverlay from './components/SearchOverlay.vue'
import { ref } from 'vue'
import StatusBar from './components/StatusBar.vue'
import MainController from './components/controllers/MainController'
import Tour from './components/controllers/Tour'
import AlertToast from './components/AlertToast.vue'
import TooltipPopup from './components/TooltipPopup.vue'
import AttributePanel from './components/AttributePanel.vue'
import Feature, { Attribute } from './types/Feature'

const selectedTool = ref(null);
const progress = ref(1);
const coordinates = ref({ x: 0, y: 0, z: 0 });

function selectPanel(key: string) {
  if (key === selectedTool.value) {
    selectedTool.value = null;
  } else {
    selectedTool.value = key;
  }
}

function onGiro3DMounted() {
  const main = MainController.get();
  main.addEventListener('update', () => {
    progress.value = main.mainInstance.progress;
  })

  Tour.start(main.mainInstance, null, main.camera, null);
}

const mouse = ref({ x: 0, y: 0});
const pickedFeature = ref<Feature>(null);
const tooltip = ref<string>(null);

function toFeature(name: string, olFeature?: OLFeature): Feature {
  const attributes: Array<Attribute> = [];
    if (olFeature) {

      for (const attr of olFeature.getKeys()) {
        if (attr !== 'geometry') {
          attributes.push({ key: attr, value: olFeature.get(attr) });
        }
      }

    }
  return new Feature(name, attributes);
}

function pick(event: MouseEvent, clicked: boolean) {
  mouse.value = { x: event.clientX, y: event.clientY };

  const mainController = MainController.get();
  const instance = mainController?.mainInstance;

  if (!instance) {
    return;
  }

  const picks = instance.pickObjectsAt(event, {
    radius: 1,
    limit: 1
  });

  if (picks.length > 0) {
    const point = picks[0].point;
    coordinates.value.x = point.x;
    coordinates.value.y = point.y;
    coordinates.value.z = point.z;
  }

  const pick = mainController.getVectorFeatureAt(event);

  if (pick) {
    const name = pick.layer?.id ?? '?';
    tooltip.value = name;
    if (clicked) {
      pickedFeature.value = toFeature(name, pick.feature);
    }
  } else {
    tooltip.value = null;
    if (clicked) {
      pickedFeature.value = null;
    }
  }
}

// const attributes = [
//   { key: 'height', value: 123 },
//   { key: 'cat', value: 'building' },
//   { key: 'admin', value: 'France' },
// ];

</script>

<template>
  <MainView id="main-view" @vue:mounted="() => onGiro3DMounted()" @click="(evt) => pick(evt, true)" @mousemove="(evt) => pick(evt)" class="mainview" />
  <AttributePanel v-if="pickedFeature != null" @close="pickedFeature = null" :attributelist="pickedFeature.attributes" :name="pickedFeature.name" class="component attribute-panel" />
  <StatusBar class="component statusbar" :x="coordinates.x" :y="coordinates.y" :z="coordinates.z"/>
  <TheToolbar id="toolbar" :active="selectedTool" class="component toolbar" v-on:selected="v => selectPanel(v)" />
  <MinimapView class="component minimap" />
  <TooltipPopup v-if="tooltip != null" :pos="mouse" :text="tooltip"/>
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
  border-radius: 0.2rem;
  border-style: sol;
  right: 0;
  bottom: 0;
  width: 350px;
  height: 60%;
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
