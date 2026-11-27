<script setup lang="ts">
    import Instance from '@giro3d/giro3d/core/Instance';
    import Inspector from '@giro3d/giro3d/gui/Inspector';
    import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

    import type { PieroContext } from '@/context';

    import { useGiro3dStore } from '@/stores/giro3d';
    import { useWidgetStore } from '@/stores/widgets';

    const mainView = ref<HTMLDivElement | null>(null);
    const inspectorView = ref<HTMLDivElement | null>(null);
    const instance = shallowRef<Instance | null>(null);

    const store = useGiro3dStore();
    const widgetStore = useWidgetStore();

    defineProps<{ context: PieroContext }>();

    onMounted(() => {
        instance.value = new Instance({
            backgroundColor: null,
            crs: store.getCRS(),
            target: mainView.value as HTMLDivElement,
        });
        store.setMainView(instance.value);

        if (!import.meta.env.PROD) {
            const inspector = Inspector.attach(
                inspectorView.value as HTMLDivElement,
                instance.value,
                {
                    title: 'Inspector',
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
            instance.value.view.setControls(null);
            instance.value.dispose();
        }
    });
</script>

<template>
    <div class="main position-relative">
        <div ref="mainView" class="main piero-background" id="main-view"></div>
        <div
            ref="inspectorView"
            id="inspector"
            class="position-absolute top-0 start-0 mh-100 overflow-auto"
        ></div>
        <div class="widgets">
            <div
                v-for="(widget, index) in widgetStore.getWidgets()"
                :key="index"
                :id="`widget-${widget.id}`"
            >
                <component :context="context" :is="widget.component"></component>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .main {
        width: 100%;
        height: 100%;
    }

    .widgets {
        pointer-events: none;
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
    }

    .widgets > div {
        pointer-events: all;
    }
</style>
