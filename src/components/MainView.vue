<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef } from 'vue'
import Inspector from '@giro3d/giro3d/gui/Inspector';
import { Instance } from '@giro3d/giro3d/core';
import { useGiro3dStore } from '@/stores/giro3d';

const mainView = ref<HTMLDivElement | null>(null);
const inspectorView = ref<HTMLDivElement | null>(null);
const instance = shallowRef<Instance | null>(null);

const store = useGiro3dStore();

onMounted(() => {
    instance.value = new Instance(mainView.value as HTMLDivElement, {
            crs: store.getCRS(),
            renderer: {
                clearColor: false,
            },
    })
    store.setMainView(instance.value);

    Inspector.attach(inspectorView.value as HTMLDivElement, instance.value, { title: 'Main view', width: 300 });
})

onUnmounted(() => {
    instance.value?.dispose();
})

</script>

<template>
    <div class="main">
        <div id="orbit-helper" class="helper"><i class="bi bi-mouse2-fill text-dark shadow"></i></div>
        <div ref="mainView" class="main" id="main-view"></div>
        <div ref="inspectorView" id="inspector" class="position-absolute top-0 start-0 mh-100 overflow-auto"></div>
    </div>
</template>

<style scoped>
.main {
    width: 100%;
    height: 100%;
}

.helper {
    border-radius: 50%;
    border-width: 2px;
    border-style: solid;
    width: 28px;
    height: 28px;
    text-align: center;
    vertical-align: middle;
    background-color: orange;
    box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.2);
    opacity:  70%;
}
</style>
