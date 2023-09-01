<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MainController from './controllers/MainController'
import Inspector from '@giro3d/giro3d/gui/Inspector';

const mainView = ref(null);
const inspectorView = ref(null);

onMounted(() => {
    const mainCtrl = MainController.init(mainView.value);

    Inspector.attach(inspectorView.value, mainCtrl.mainInstance, { title: 'Main view', width: 300 });
    // TODO minimap inspector
})

onUnmounted(() => {
    MainController.get().dispose();
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
</style>