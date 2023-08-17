<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BasemapController from './controllers/BasemapController.js'
import OverlayController from './controllers/OverlayController';
import MainController from './controllers/MainController'

const mainView = ref(null);
const inspectorView = ref(null);

onMounted(() => {
    MainController.init(mainView.value, inspectorView.value);

    // BasemapController.onGiro3DMounted(main);
    // BasemapController.loadBasemaps(main.mainInstance);
    // OverlayController.loadOverlays(main.mainInstance);
})

onUnmounted(() => {
    MainController.get().dispose();
})

</script>

<template>
    <div>
        <div ref="mainView" class="main" id="main-view"></div>
        <div ref="inspectorView" id="inspector" class="position-absolute top-0 start-0 mh-100 overflow-auto"></div>
    </div>
</template>

<style scoped>
.main {
    width: 100%;
    height: 100%;
}
</style>