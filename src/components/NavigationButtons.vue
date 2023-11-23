<script setup lang="ts">
import { ref, watch } from 'vue';
import NavigationMode from '@/types/NavigationMode';
import SwitchToggle from './SwitchToggle.vue';
import { useCameraStore } from '@/stores/camera';
const camera = useCameraStore();

const navigationMode = ref<NavigationMode>(camera.getNavigationMode());
watch(navigationMode, (newMode, oldMode) => {
    camera.setNavigationMode(newMode);
});
</script>

<template>
    <div class="card root">
        <div class="d-flex">
            <i title="Free navigation" class="mx-2 bi bi-camera-reels-fill"></i>
            <SwitchToggle :model-value="navigationMode === 'first-person'" @update:model-value="v => navigationMode = v ? 'first-person' : 'orbit'" />
            <i title="First person view" class="bi bi-universal-access"></i>
        </div>
    </div>
</template>

<style scoped>
.root {
    padding: 0.3rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    margin: 1rem;
}
</style>