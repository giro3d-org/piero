<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Giro3DManager from '@/services/Giro3DManager'
import Inspector from '@giro3d/giro3d/gui/Inspector';

const mainView = ref(null);
const inspectorView = ref(null);
const emits = defineEmits(['Giro3DManager'])

let giro3d : Giro3DManager;

onMounted(() => {
    giro3d = Giro3DManager.init(mainView.value);

    Inspector.attach(inspectorView.value, giro3d.mainInstance, { title: 'Main view', width: 300 });
    emits('Giro3DManager', giro3d);
})

onUnmounted(() => {
    giro3d?.dispose();
})

</script>

<template>
    <div class="main">
        <div ref="mainView" class="main" id="main-view"></div>
        <div ref="inspectorView" id="inspector" class="position-absolute top-0 start-0 mh-100 overflow-auto"></div>
    </div>
</template>

<style scoped>
.main {
    width: 100%;
    height: 100%;
}
</style>.@/services/Giro3DManager