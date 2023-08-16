<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Giro3DController from './controllers/Giro3DController.js'
import BasemapController from './controllers/BasemapController.js'

const mainView = ref(null);
const inspectorView = ref(null);

onMounted(() => {
    const instance = Giro3DController.mountGiro3D(mainView.value, inspectorView.value);

    BasemapController.loadBasemaps(instance);
})

onUnmounted(() => {
    Giro3DController.unmountGiro3D()
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