<script setup lang="ts">
    import CityJSONEntityInspector from '@/giro3d/CityJSONEntityInspector';
    import IfcEntityInspector from '@/giro3d/IfcEntityInspector';
    import { useGiro3dStore } from '@/stores/giro3d';
    import Instance from '@giro3d/giro3d/core/Instance';
    import EntityPanel from '@giro3d/giro3d/gui/EntityPanel';
    import Inspector from '@giro3d/giro3d/gui/Inspector';
    import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

    const mainView = ref<HTMLDivElement | null>(null);
    const inspectorView = ref<HTMLDivElement | null>(null);
    const instance = shallowRef<Instance | null>(null);

    const store = useGiro3dStore();

    onMounted(() => {
        instance.value = new Instance({
            target: mainView.value as HTMLDivElement,
            crs: store.getCRS(),
            backgroundColor: null,
        });
        store.setMainView(instance.value);

        if (!import.meta.env.PROD) {
            EntityPanel.registerInspector('CityJSONEntity', CityJSONEntityInspector);
            EntityPanel.registerInspector('IfcEntity', IfcEntityInspector);

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
            // @ts-expect-error Giro3D Instance API doesn't support setting it to undefined, but it works and is necessary before disposing
            instance.value.controls = undefined;
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
