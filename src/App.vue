<script setup>
import TheToolbar from './components/TheToolbar.vue'
import TheMinimap from './components/TheMinimap.vue'
import The3DView from './components/The3DView.vue'
import PanelItem from './components/PanelItem.vue'
</script>

<template>
  <The3DView class="view" />
  <TheToolbar class="component toolbar" />
  <TheMinimap class="component minimap"/>
  <PanelItem class="component panel" />
</template>

<style scoped>
.component {
  background: var(--color-background-soft);
}

.panel {
  position: absolute;
  height: 100vh;
  left: 4rem;
  width: 30rem;
  z-index: 1;
}

.view {
  position: absolute;
  background-color: aliceblue;
  height: 100vh;
  left: 4rem;
  width: calc(100% - 4rem);
  z-index: 0;
}

.toolbar {
    width: 4rem;
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
