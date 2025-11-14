<script setup lang="ts">
    import Extent from '@giro3d/giro3d/core/geographic/Extent';
    import { Vector2, Vector3 } from 'three';
    import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

    import type Feature from '@/types/Feature';

    import Giro3DManager from '@/services/Giro3DManager';
    import { useAnnotationStore } from '@/stores/annotations';
    import { useCameraStore } from '@/stores/camera';
    import { useGiro3dStore } from '@/stores/giro3d';
    import { useMeasurementStore } from '@/stores/measurement';

    import type { PanelType } from './components/Configuration';
    import type { PieroContext } from './context';

    import { isLocationSearchResult, type SearchResult } from './api/SearchApi';
    import { ViewApiImpl } from './api/ViewApi';
    import AlertToast from './components/AlertToast.vue';
    import AttributePanel from './components/AttributePanel.vue';
    import LoadingScreen from './components/LoadingScreen.vue';
    import MainView from './components/MainView.vue';
    import NavigationButtons from './components/NavigationButtons.vue';
    import PanelContainer from './components/PanelContainer.vue';
    import ProgressBar from './components/ProgressBar.vue';
    import SearchOverlay from './components/SearchOverlay.vue';
    import StatusBar from './components/StatusBar.vue';
    import ToolBar from './components/toolbar/ToolBar.vue';
    import { GLOBAL_EVENT_DISPATCHER } from './events';
    import { useWidgetStore } from './stores/widgets';

    const { getContext } = defineProps<{
        getContext: () => PieroContext;
    }>();

    const selectedTool = ref<PanelType | null>('datasets');
    const progress = ref(1);
    const coordinates = ref(new Vector3(0, 0, 0));
    const mouse = new Vector2();
    const pickedFeature = ref<Feature | null>(null);
    const tooltip = ref<string | null>(null);
    const isLoading = ref(false);
    const showLoadingScreen = ref(true);
    let hasMovedDuringFrame = false;

    const giro3dStore = useGiro3dStore();
    const cameraStore = useCameraStore();
    const annotationStore = useAnnotationStore();
    const measurementStore = useMeasurementStore();
    const widgetStore = useWidgetStore();

    const giro3d = shallowRef<Giro3DManager | null>(null);
    const debounce = ref<NodeJS.Timeout | number | string | undefined>();

    onMounted(() => {
        const mainview = giro3dStore.getMainView();
        if (mainview) {
            initializeGiro3DManager();
        }

        giro3dStore.$onAction(({ after, args, name }) => {
            after(() => {
                switch (name) {
                    case 'setMainView':
                        if (args[0] === null) {
                            disposeGiro3DManager();
                        } else {
                            initializeGiro3DManager();
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

        if (import.meta.env.PROD) {
            setTimeout(() => {
                showLoadingScreen.value = false;
            }, 1000);
        } else {
            showLoadingScreen.value = false;
        }

        GLOBAL_EVENT_DISPATCHER.dispatchEvent({ type: 'ready' });
    });

    onUnmounted(() => {
        if (debounce.value != null) {
            clearInterval(debounce.value);
            debounce.value = undefined;
        }
        disposeGiro3DManager();
    });

    function disposeGiro3DManager(): void {
        giro3d.value?.dispose();
        giro3d.value = null;
    }

    function initializeGiro3DManager(): void {
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

        getContext().view = new ViewApiImpl({
            camera: giro3d.value.camera,
            instance: giro3d.value.mainInstance,
        });
    }

    function onMouseMove(event: MouseEvent): void {
        if (giro3d.value) {
            giro3d.value.mainInstance.eventToCanvasCoords(event, mouse);
            hasMovedDuringFrame = true;
        }
    }

    function onSearchResultSelected(result: SearchResult): void {
        if (!giro3d.value) {
            return;
        }

        if (isLocationSearchResult(result)) {
            const instance = giro3d.value.mainInstance;
            const poiCoordinates = result.coordinates.as(instance.referenceCrs);
            const target = Extent.fromCenterAndSize(
                poiCoordinates.crs,
                poiCoordinates.toVector2(),
                1000,
                1000,
            );

            const bbox3 = target.toBox3(poiCoordinates.z, poiCoordinates.z + 200);
            void giro3d.value.camera.lookTopDownAt(bbox3, false);
        }
    }

    function pick(event: MouseEvent, clicked?: boolean): void {
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

    function selectPanel(key: PanelType): void {
        if (key === selectedTool.value) {
            selectedTool.value = null;
        } else {
            selectedTool.value = key;
        }
    }

    function updateCoordinates(mouse: Vector2): void {
        if (giro3d.value != null) {
            const point = giro3d.value.picker.getMouseCoordinate(giro3d.value.mainInstance, mouse);

            if (point) {
                coordinates.value.x = point.x;
                coordinates.value.y = point.y;
                coordinates.value.z = point.z;
            }
        }
    }

    function updateCursor(mouse: Vector2): void {
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
</script>

<template>
    <LoadingScreen v-if="showLoadingScreen" />
    <MainView
        id="main-view"
        @click="(evt: MouseEvent) => pick(evt, true)"
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
    <PanelContainer v-if="selectedTool != null" class="component panel" :selected="selectedTool" />
    <ProgressBar :progress="progress" class="loading-indicator" />
    <SearchOverlay id="address-search" class="search" @result-selected="onSearchResultSelected" />
    <NavigationButtons class="navigation-buttons" />
    <AlertToast />

    <div
        v-for="(widget, index) in widgetStore.getWidgets()"
        :key="index"
        :id="`widget-${widget.id}`"
    >
        <component :context="getContext()" :is="widget.component"></component>
    </div>
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
        width: 25rem;
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
</style>
