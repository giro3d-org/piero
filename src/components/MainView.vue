<script setup lang="ts">
    import { ref, onMounted, onUnmounted, shallowRef } from 'vue';
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
        });
        store.setMainView(instance.value);

        if (!import.meta.env.PROD) {
            const inspector = Inspector.attach(
                inspectorView.value as HTMLDivElement,
                instance.value,
                {
                    title: 'Main view',
                    width: 300,
                },
            );
            store.setInspector(inspector);
        }
    });

    onUnmounted(() => {
        if (!import.meta.env.PROD) {
            store.getInspector()?.detach();
            store.setInspector(null);
        }
        store.setMainView(null);
        if (instance.value) {
            // @ts-expect-error
            instance.value.controls = null;
            instance.value.dispose();
        }
    });
</script>

<template>
    <div class="main">
        <div ref="mainView" class="main" id="main-view"></div>
        <div
            ref="inspectorView"
            id="inspector"
            class="position-absolute top-0 start-0 mh-100 overflow-auto"
        ></div>
    </div>
</template>

<style scoped>
    .main {
        width: 100%;
        height: 100%;
    }
</style>
