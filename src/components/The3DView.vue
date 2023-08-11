<script setup>
import { onMounted, onUnmounted } from 'vue'
import Giro3DController from './controllers/Giro3DController.js'
import BasemapController from './controllers/BasemapController.js'

onMounted(() => {
    const mainDiv = document.getElementById('main-view');
    const inspectorDiv = document.getElementById('inspector');
    const instance = Giro3DController.mountGiro3D(mainDiv, inspectorDiv)
    BasemapController.loadBasemaps(instance);
})

onUnmounted(() => {
    Giro3DController.unmountGiro3D()
})

</script>

<template>
    <div id="main-view"></div>
    <div id="inspector" class="position-absolute top-0 start-0 mh-100 overflow-auto"></div>
</template>

<style scoped>

</style>