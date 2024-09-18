<script setup lang="ts">
    import { useGiro3dStore } from '@/stores/giro3d';
    import Instance from '@giro3d/giro3d/core/Instance';
    import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

    const target = ref<HTMLDivElement | null>(null);
    const instance = shallowRef();
    const store = useGiro3dStore();

    onMounted(() => {
        instance.value = new Instance({
            target: target.value as HTMLDivElement,
            crs: 'EPSG:3857',
            backgroundColor: 0xcccccc,
        });
        store.setMinimapView(instance.value);
    });

    onUnmounted(() => {
        store.setMinimapView(null);
        instance.value?.dispose();
    });
</script>

<template>
    <div ref="target" class="main" />
</template>

<style scoped>
    .main {
        border-color: var(--color-border);
        border-width: 2px;
        border-style: solid;
    }
</style>
