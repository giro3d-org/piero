<script setup lang="ts">
    import { ref, watch } from 'vue';
    import NavigationMode from '@/types/NavigationMode';
    import Notification from '@/types/Notification';
    import SwitchToggle from './SwitchToggle.vue';
    import { useCameraStore } from '@/stores/camera';
    import { useNotificationStore } from '@/stores/notifications';

    const camera = useCameraStore();
    const notificationStore = useNotificationStore();

    const navigationMode = ref<NavigationMode>(camera.getNavigationMode());
    watch(navigationMode, newMode => {
        camera.setNavigationMode(newMode);

        const name = newMode === 'first-person' ? 'First person' : 'Free navigation';
        const description =
            newMode === 'first-person'
                ? 'Left-click to pan; Right-click to orbit; Scroll to zoom to cursor; Up/Down/Left/Right: pan'
                : 'Left-click to rotate; Right-click to pan; Scroll to zoom; Up/Down/Left/Right: move';

        notificationStore.push(
            new Notification(
                'Navigation',
                `Navigation mode set to <strong>${name}</strong>.<br>${description}`,
                'success',
            ),
        );
    });
</script>

<template>
    <div class="card root">
        <div class="d-flex">
            <i title="Free navigation" class="mx-2 bi bi-camera-reels-fill"></i>
            <SwitchToggle
                :model-value="navigationMode === 'first-person'"
                @update:model-value="v => (navigationMode = v ? 'first-person' : 'orbit')"
            />
            <i title="First person view" class="bi bi-universal-access"></i>
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
