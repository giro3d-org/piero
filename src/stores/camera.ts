import CameraPosition from '@/types/CameraPosition';
import NavigationMode from '@/types/NavigationMode';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import { defineStore } from 'pinia';
import { Box3, Object3D } from 'three';
import { ref } from 'vue';

export const useCameraStore = defineStore('camera', () => {
    const cameraPosition = ref<CameraPosition>();
    const navigationMode = ref<NavigationMode>('orbit');
    const _isUserInteracting = ref<boolean>(false);

    function getCameraPosition(): CameraPosition {
        if (cameraPosition.value === undefined) throw new Error('Cannot get cameraPosition');

        const json: Record<string, any> = {};
        json.title = 'foo';
        const pos = cameraPosition.value.camera;
        const target = cameraPosition.value.target;
        const fo = cameraPosition.value.focalOffset;
        json.position = {
            x: pos.x,
            y: pos.y,
            z: pos.z,
        };
        json.target = {
            x: target.x,
            y: target.y,
            z: target.z,
        };
        json.focalOffset = {
            x: fo.x,
            y: fo.y,
            z: fo.z,
        };
        console.log(json);
        return cameraPosition.value;
    }

    function setCameraPosition(pos: CameraPosition) {
        cameraPosition.value = pos;
    }

    function setCurrentPosition(pos: CameraPosition) {
        cameraPosition.value = pos;
    }

    function getNavigationMode() {
        return navigationMode.value;
    }

    function setNavigationMode(mode: NavigationMode) {
        navigationMode.value = mode;
    }

    function isUserInteracting(): boolean {
        return _isUserInteracting.value;
    }

    function setIsUserInteracting(value: boolean) {
        _isUserInteracting.value = value;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function lookTopDownAt(obj: Box3 | Object3D | Entity3D) {
        // Nothing to do, rely on action listeners.
    }

    return {
        getCameraPosition,
        setCameraPosition,
        setCurrentPosition,
        getNavigationMode,
        setNavigationMode,
        isUserInteracting,
        setIsUserInteracting,
        lookTopDownAt,
    };
});
