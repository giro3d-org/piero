<script setup lang="ts">
    import { useCameraStore } from '@/stores/camera';
    import { useNotificationStore } from '@/stores/notifications';
    import type NavigationMode from '@/types/NavigationMode';
    import Notification from '@/types/Notification';
    import type { Ref } from 'vue';
    import { ref, watch } from 'vue';
    import SwitchToggle from './SwitchToggle.vue';

    const camera = useCameraStore();
    const notificationStore = useNotificationStore();

    const navigationMode = ref<Ref<NavigationMode>>(camera.getNavigationModeRef());
    watch(navigationMode, newMode => {
        camera.setNavigationMode(newMode);

        let name: string;
        let description: string;

        switch (newMode) {
            case 'first-person': {
                name = 'First person';
                description = `<i class="bi bi-hand-index-thumb"></i> Left-click to rotate; Right-click to pan<br>
                    <i class="bi bi-mouse2"></i> Scroll to zoom<br>
                    <i class="bi bi-keyboard"></i> Up/Down/Left/Right: move forward/backward/left/right<br>
                    <i class="bi bi-keyboard"></i> W/D/A/S: move up/down/left/right`;
                break;
            }
            case 'orbit': {
                name = 'Free navigation';
                description = `<i class="bi bi-hand-index-thumb"></i> Left-click to pan; Right-click to orbit<br>
                    <i class="bi bi-mouse2"></i>  Scroll to zoom to cursor<br>
                    <i class="bi bi-keyboard"></i> Up/Down/Left/Right: move forward/backward/left/right`;
                break;
            }
            case 'position-on-map': {
                name = 'Position on map';
                description = `<i class="bi bi-hand-index-thumb"></i> Left-click on the map to move to First Person view on the ground.<br>
                    Cancel with right-click or Escape`;
                break;
            }
            case 'disabled': {
                name = 'Disabled';
                description = 'Camera is disabled';
                break;
            }
            default: {
                // Exhaustiveness checking
                const _exhaustiveCheck: never = newMode;
                return _exhaustiveCheck;
            }
        }

        notificationStore.push(
            new Notification(
                'Navigation',
                `Navigation mode set to <strong>${name}</strong>.<br>${description}`,
                'success',
            ),
        );
    });

    function onPositionOnMapToggle() {
        if (navigationMode.value !== 'position-on-map') {
            navigationMode.value = 'position-on-map';
        } else {
            navigationMode.value = 'orbit';
        }
    }
</script>

<template>
    <div class="card root">
        <div class="d-flex align-items-center">
            <i title="Free navigation" class="mx-2 bi bi-camera-reels-fill"></i>
            <SwitchToggle
                :model-value="navigationMode === 'first-person'"
                @update:model-value="v => (navigationMode = v ? 'first-person' : 'orbit')"
            />
            <i title="First person view" class="bi bi-universal-access"></i>
            <div class="vr mx-2"></div>
            <button
                class="btn btn-sm btn-outline-secondary"
                :class="navigationMode === 'position-on-map' ? 'active' : null"
                :aria-pressed="navigationMode === 'position-on-map'"
                data-bs-toggle="button"
                title="Position on map"
                @click="onPositionOnMapToggle"
            >
                <i class="fg-position-man"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
    .root {
        padding: 0.3rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        margin: 1rem;
    }
</style>
