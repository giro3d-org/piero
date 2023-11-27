<script setup lang="ts">
import { useGiro3dStore } from '@/stores/giro3d';
import Instance from '@giro3d/giro3d/core/Instance';
import { onMounted, ref, shallowRef } from 'vue';

const target = ref(null);
const instance = shallowRef();
const store = useGiro3dStore();

onMounted(() => {
    instance.value = new Instance(target.value, {
        crs: 'EPSG:3857',
        renderer: {
            clearColor: 0xcccccc,
        },
    })
    store.setMinimapView(instance.value);
})
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
