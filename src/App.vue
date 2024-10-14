<script setup lang="ts">
    import { type GeocodingResult } from '@/providers/Geocoding';
    import Giro3DManager from '@/services/Giro3DManager';
    import MinimapController from '@/services/MinimapController';
    import Tour from '@/services/Tour';
    import { useAnnotationStore } from '@/stores/annotations';
    import { useCameraStore } from '@/stores/camera';
    import { useGiro3dStore } from '@/stores/giro3d';
    import { useMeasurementStore } from '@/stores/measurement';
    import type Feature from '@/types/Feature';
    import type Instance from '@giro3d/giro3d/core/Instance';
    import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
    import Extent from '@giro3d/giro3d/core/geographic/Extent';
    import { Vector2, Vector3 } from 'three';
    import { defineAsyncComponent, onMounted, onUnmounted, ref, shallowRef } from 'vue';
    import AlertToast from './components/AlertToast.vue';
    import type { PanelType } from './components/Configuration';
    import MainView from './components/MainView.vue';
    import MinimapView from './components/MinimapView.vue';
    import NavigationButtons from './components/NavigationButtons.vue';
    import ProgressBar from './components/ProgressBar.vue';
    import SearchOverlay from './components/SearchOverlay.vue';
    import StatusBar from './components/StatusBar.vue';
    import ToolBar from './components/toolbar/ToolBar.vue';

    const AttributePanel = defineAsyncComponent(() => import('./components/AttributePanel.vue'));
    const PanelContainer = defineAsyncComponent(() => import('./components/PanelContainer.vue'));

    const selectedTool = ref<PanelType | null>('datasets');
    const progress = ref(1);
    const coordinates = ref(new Vector3(0, 0, 0));
    let mouse = new Vector2();
    const pickedFeature = ref<Feature | null>(null);
    const tooltip = ref<string | null>(null);
    const isLoading = ref(false);
    let hasMovedDuringFrame = false;

    const giro3dStore = useGiro3dStore();
    const cameraStore = useCameraStore();
    const annotationStore = useAnnotationStore();
    const measurementStore = useMeasurementStore();

    const giro3d = shallowRef<Giro3DManager | null>(null);
    const minimap = shallowRef<MinimapController | null>(null);
    const debounce = ref<NodeJS.Timeout | string | number | undefined>();

    onMounted(() => {
        const mainview = giro3dStore.getMainView();
        const minimapView = giro3dStore.getMinimapView();
        if (mainview) {
            initializeGiro3DManager(mainview);
        }
        if (minimapView) {
            initializeMinimap(minimapView);
        }

        giro3dStore.$onAction(({ name, after, args }) => {
            after(() => {
                switch (name) {
                    case 'setMainView':
                        if (args[0] === null) {
                            disposeGiro3DManager();
                        } else {
                            initializeGiro3DManager(args[0]);
                        }
                        break;
                    case 'setMinimapView':
                        if (args[0] === null) {
                            disposeMinimap();
                        } else {
                            initializeMinimap(args[0]);
                        }
                        break;
                }
            });
        });

        // debouncing costly functions
        debounce.value = setInterval(() => {
            if (hasMovedDuringFrame) {
                updateCoordinates(mouse);
                updateCursor(mouse);
                hasMovedDuringFrame = false;
            }
        }, 50);

        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            if (import.meta.env.PROD) {
                loadingScreen.style.transition = 'opacity 1s linear';
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.remove(), 1000);
            } else {
                loadingScreen.remove();
            }
        }
    });

    onUnmounted(() => {
        if (debounce.value != null) {
            clearInterval(debounce.value);
            debounce.value = undefined;
        }
        disposeMinimap();
        disposeGiro3DManager();
    });

    function initializeGiro3DManager(instance: Instance) {
        const mainview = giro3dStore.getMainView();
        if (mainview === null) {
            throw new Error('mainview is null');
        }
        giro3d.value = new Giro3DManager(mainview);
        giro3d.value.addEventListener('update', () => {
            if (giro3d.value) {
                progress.value = giro3d.value.mainInstance.progress;
                isLoading.value = giro3d.value.mainInstance.loading;
            }
        });

        if (minimap.value) {
            minimap.value.setMainInstance(instance);
        }

        Tour.start(giro3d.value.camera);
    }

    function disposeGiro3DManager() {
        if (minimap.value) {
            minimap.value.setMainInstance(null);
        }
        giro3d.value?.dispose();
        giro3d.value = null;
    }

    function initializeMinimap(instance: Instance) {
        minimap.value = new MinimapController(instance);
        if (giro3d.value) {
            minimap.value.setMainInstance(giro3d.value.mainInstance);
        }
    }

    function disposeMinimap() {
        minimap.value?.dispose();
    }

    function selectPanel(key: PanelType) {
        if (key === selectedTool.value) {
            selectedTool.value = null;
        } else {
            selectedTool.value = key;
        }
    }

    function pick(event: MouseEvent, clicked?: boolean) {
        if (giro3d.value == null || giro3d.value.mainInstance == null) {
            return;
        }

        if (
            cameraStore.getNavigationMode() === 'position-on-map' ||
            cameraStore.isUserInteracting() ||
            annotationStore.isUserDrawing() ||
            measurementStore.isUserMeasuring()
        ) {
            return;
        }

        const picked = giro3d.value.picker.pick(giro3d.value.mainInstance, event);

        if (picked?.point != null) {
            const point = picked.point;
            coordinates.value.x = point.x;
            coordinates.value.y = point.y;
            coordinates.value.z = point.z;
        }

        if (picked?.feature != null) {
            tooltip.value = picked.feature.name;
            if (clicked != null) {
                pickedFeature.value = picked.feature;
            }
        } else {
            tooltip.value = null;
            if (clicked != null) {
                pickedFeature.value = null;
            }
        }

        if (picked?.pickResult != null) {
            giro3d.value.highlighter.highlightFromPick(picked.pickResult);
        } else {
            giro3d.value.highlighter.clear();
        }
    }

    function updateCoordinates(mouse: Vector2) {
        if (giro3d.value != null) {
            const point = giro3d.value.picker.getMouseCoordinate(giro3d.value.mainInstance, mouse);

            if (point) {
                coordinates.value.x = point.x;
                coordinates.value.y = point.y;
                coordinates.value.z = point.z;
            }
        }
    }

    function updateCursor(mouse: Vector2) {
        if (giro3d.value) {
            if (
                cameraStore.getNavigationMode() === 'position-on-map' ||
                annotationStore.isUserDrawing() ||
                measurementStore.isUserMeasuring()
            ) {
                return;
            }
            const picked = giro3d.value.picker.hasFeature(giro3d.value.mainInstance, mouse);
            giro3d.value.mainInstance.domElement.style.cursor = picked ? 'pointer' : 'auto';
        }
    }

    function onMouseMove(event: MouseEvent) {
        if (giro3d.value) {
            giro3d.value.mainInstance.eventToCanvasCoords(event, mouse);
            hasMovedDuringFrame = true;
        }
    }

    function onPointOfInterestSelected(poi: GeocodingResult) {
        if (!giro3d.value) {
            return;
        }
        const instance = giro3d.value.mainInstance;
        const poiCoordinates = new Coordinates(poi.crs, poi.x, poi.y, poi.z).as(
            instance.referenceCrs,
        );
        const target = Extent.fromCenterAndSize(
            poiCoordinates.crs,
            poiCoordinates.toVector2(),
            1000,
            1000,
        );
        const bbox3 = target.toBox3(poi.z, poi.z + 200);
        giro3d.value.camera.lookTopDownAt(bbox3, false);
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
        @restart-tour="Tour.restart()"
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
