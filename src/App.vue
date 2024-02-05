<script setup lang="ts">
    import { Vector3 } from 'three';
    import { defineAsyncComponent, ref } from 'vue';
    import { Instance } from '@giro3d/giro3d/core';
    import { Extent } from '@giro3d/giro3d/core/geographic';

    import AlertToast from './components/AlertToast.vue';
    import ToolBar from './components/toolbar/ToolBar.vue';
    import MinimapView from './components/MinimapView.vue';
    import MainView from './components/MainView.vue';
    import ProgressBar from './components/ProgressBar.vue';
    import SearchOverlay from './components/SearchOverlay.vue';
    import NavigationButtons from './components/NavigationButtons.vue';
    import StatusBar from './components/StatusBar.vue';
    import { PanelType } from './components/Configuration';

    import Giro3DManager from '@/services/Giro3DManager';
    import MinimapController from '@/services/MinimapController';
    import Tour from '@/services/Tour';
    import { useGiro3dStore } from '@/stores/giro3d';
    import { useCameraStore } from '@/stores/camera';
    import { useAnnotationStore } from '@/stores/annotations';
    import { useMeasurementStore } from '@/stores/measurement';
    import Feature from '@/types/Feature';

    const AttributePanel = defineAsyncComponent(() => import('./components/AttributePanel.vue'));
    const PanelContainer = defineAsyncComponent(() => import('./components/PanelContainer.vue'));

    const selectedTool = ref<PanelType | null>(null);
    const progress = ref(1);
    const coordinates = ref(new Vector3(0, 0, 0));
    const mouse = ref({ x: 0, y: 0 });
    const pickedFeature = ref<Feature | null>(null);
    const tooltip = ref<string | null>(null);
    const isLoading = ref(false);

    const giro3dStore = useGiro3dStore();
    const cameraStore = useCameraStore();
    const annotationStore = useAnnotationStore();
    const measurementStore = useMeasurementStore();

    let giro3d: Giro3DManager;
    let minimap: MinimapController;

    function initializeGiro3DManager(instance: Instance) {
        const mainview = giro3dStore.getMainView();
        if (mainview === null) throw new Error('mainview is null');
        giro3d = new Giro3DManager(mainview);
        giro3d.addEventListener('update', () => {
            progress.value = giro3d.mainInstance.progress;
            isLoading.value = giro3d.mainInstance.loading;
        });

        if (minimap) {
            minimap.setMainInstance(instance);
        }

        Tour.start(giro3d.mainInstance, null, giro3d.camera, null);
    }

    function initializeMinimap(instance: Instance) {
        minimap = new MinimapController(instance);
        if (giro3d) {
            minimap.setMainInstance(giro3d.mainInstance);
        }
    }

    const mainview = giro3dStore.getMainView();

    if (mainview) {
        initializeGiro3DManager(mainview);
    }

    if (giro3dStore.getMinimapView() && mainview) {
        initializeGiro3DManager(mainview);
    }

    giro3dStore.$onAction(({ name, after, args }) => {
        after(() => {
            switch (name) {
                case 'setMainView':
                    initializeGiro3DManager(args[0]);
                    break;
                case 'setMinimapView':
                    initializeMinimap(args[0]);
                    break;
            }
        });
    });

    function selectPanel(key: PanelType) {
        if (key === selectedTool.value) {
            selectedTool.value = null;
        } else {
            selectedTool.value = key;
        }
    }

    function pick(event: MouseEvent, clicked?: boolean) {
        if (!giro3d || !giro3d.mainInstance) {
            return;
        }

        if (
            cameraStore.getNavigationMode() !== 'orbit' ||
            cameraStore.isUserInteracting() ||
            annotationStore.isUserDrawing() ||
            measurementStore.isUserMeasuring()
        ) {
            return;
        }

        mouse.value = { x: event.clientX, y: event.clientY };

        const picked = giro3d.picker.pick(giro3d.mainInstance, event);

        if (picked?.point) {
            const point = picked.point;
            coordinates.value.x = point.x;
            coordinates.value.y = point.y;
            coordinates.value.z = point.z;
        }

        if (picked?.feature) {
            tooltip.value = picked.feature.name;
            if (clicked) {
                pickedFeature.value = picked.feature;
            }
        } else {
            tooltip.value = null;
            if (clicked) {
                pickedFeature.value = null;
            }
        }

        if (picked?.pickResult) {
            giro3d.highlighter.highlightFromPick(picked.pickResult);
        } else {
            giro3d.highlighter.clear();
        }
    }

    function updateCoordinates(event: MouseEvent) {
        if (giro3d) {
            const point = giro3d.picker.getMouseCoordinate(giro3d.mainInstance, event);

            if (point) {
                coordinates.value.x = point.x;
                coordinates.value.y = point.y;
                coordinates.value.z = point.z;
            }
        }
    }

    function updateCursor(event: MouseEvent) {
        if (giro3d) {
            if (annotationStore.isUserDrawing() || measurementStore.isUserMeasuring()) {
                return;
            }
            const picked = giro3d.picker.hasFeature(giro3d.mainInstance, event);
            giro3d.mainInstance.domElement.style.cursor = picked ? 'pointer' : 'auto';
        }
    }

    function onMouseMove(event: MouseEvent) {
        updateCoordinates(event);
        updateCursor(event);
    }

    function onPointOfInterestSelected(poi: Vector3) {
        if (!giro3d) {
            return;
        }
        const layerManager = giro3d.layerManager;
        const instance = giro3d.mainInstance;
        // The API is in this CRS
        const sourceCrs = 'EPSG:2154';

        const aoi = Extent.fromCenterAndSize(sourceCrs, { x: poi.x, y: poi.y }, 10000, 10000).as(
            instance.referenceCrs,
        );

        if (!aoi.isInside(layerManager.extent)) {
            const newExtent = layerManager.extent.clone();
            newExtent.union(aoi);
            layerManager.setExtent(newExtent);
        }

        const target = Extent.fromCenterAndSize(sourceCrs, { x: poi.x, y: poi.y }, 1000, 1000).as(
            instance.referenceCrs,
        );
        const bbox3 = target.toBox3(poi.z, poi.z + 200);
        giro3d.camera.lookTopDownAt(bbox3, false);
    }
</script>

<template>
    <MainView
        id="main-view"
        @click="evt => pick(evt, true)"
        @mousemove="onMouseMove"
        class="mainview"
    />
    <AttributePanel
        v-if="pickedFeature != null"
        @close="pickedFeature = null"
        :attributes="pickedFeature.attributes"
        :name="pickedFeature.name"
        :parent="pickedFeature.parent"
        :point="pickedFeature.point"
        class="component attribute-panel"
    />
    <StatusBar
        class="component statusbar"
        :x="coordinates.x"
        :y="coordinates.y"
        :z="coordinates.z"
    />
    <ToolBar
        id="toolbar"
        :active="selectedTool"
        class="component toolbar"
        v-on:selected="v => selectPanel(v)"
    />
    <MinimapView class="component minimap" />
    <PanelContainer
        v-if="selectedTool != null"
        class="component panel"
        :selected="selectedTool"
        @restart-tour="Tour.start(giro3d.mainInstance, null, giro3d.camera, null)"
    />
    <ProgressBar :progress="progress" class="loading-indicator" />
    <SearchOverlay id="address-search" class="search" @update:poi="onPointOfInterestSelected" />
    <NavigationButtons class="navigation-buttons" />
    <AlertToast />
</template>

<style scoped>
    .component {
        background-color: var(--bs-body-bg);
    }

    .navigation-buttons {
        position: absolute;
        right: 0;
        bottom: 0;
        margin-bottom: 2rem;
    }

    .attribute-panel {
        position: absolute;
        box-shadow: -1px -1px 5px rgba(0, 0, 0, 0.5);
        border-style: sol;
        right: 0;
        bottom: 0;
        width: 370px;
        max-height: 60%;
        margin-right: 1rem;
        margin-bottom: 5rem;
    }

    .statusbar {
        padding: 0.2rem;
        text-align: center;
        border-top-left-radius: 0.5rem;
        box-shadow: -1px -1px 5px rgba(0, 0, 0, 0.1);
        height: 1.5rem;
        position: absolute;
        bottom: 0;
        right: 0;
    }

    .search {
        position: absolute;
        top: 0;
        left: calc(50% - 20rem / 2);
        width: 20rem;
    }

    .loading-indicator {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        z-index: 1;
        background-color: transparent;
    }

    .panel {
        position: absolute;
        height: 100vh;
        left: 3.5rem;
        width: 27rem;
        z-index: 1;
    }

    .mainview {
        position: absolute;
        /* background-color: cadetblue; */
        height: 100vh;
        left: 3.5rem;
        width: calc(100% - 3.5rem);
        z-index: 0;
    }

    .toolbar {
        width: 3.5rem;
        height: 100vh;
        position: absolute;
        /* background-color: rgb(250, 250, 250); */
        top: 0;
        left: 0;
    }

    .minimap {
        width: 10rem;
        height: 10rem;
        position: absolute;
        margin: 0.5rem;
        top: 0;
        right: 0;
    }
</style>
