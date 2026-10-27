<script setup lang="ts">
    import { usePanelStore } from '@/stores/panels';
    const panels = usePanelStore();
</script>

<template>
    <div v-if="panels.activePanel" class="panel" id="panel-container">
        <component :is="panels.activePanel?.component" />
    </div>
</template>

<style scoped>
    .panel {
        border-color: var(--bs-border-color);
        border-width: 0 2px 0 2px;
        border-style: solid;
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;

        padding-left: 0.5rem;
        padding-right: 0.5rem;
        padding-top: 1rem;
        padding-bottom: 1rem;
    }
</style>
