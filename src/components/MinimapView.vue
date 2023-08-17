<script setup>
import { ref, onMounted } from 'vue'
import MinimapController from './controllers/MinimapController';

const minimapView = ref(null);

onMounted(() => {
    MinimapController.loadMinimap(minimapView.value);
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
