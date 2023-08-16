<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Giro3DController from './controllers/Giro3DController.js'
import MinimapController from './controllers/MinimapController';

const minimapView = ref(null);

onMounted(() => {
    MinimapController.loadMinimap(minimapView.value);
})

onUnmounted(() => {
    Giro3DController.unmountGiro3D()
})

</script>


<template>
    <div ref="minimapView" class="main" />
</template>

<style scoped>
.main {
    border-color: var(--color-border);
    border-width: 2px;
    border-style: solid;
}
</style>
