import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type { Box3, Object3D } from 'three';
import type { Ref } from 'vue';

import { defineStore } from 'pinia';
import { Vector3 } from 'three';
import { ref } from 'vue';

import type CameraPosition from '@/types/CameraPosition';
import type NavigationMode from '@/types/NavigationMode';

export const useCameraStore = defineStore('camera', () => {
    const cameraPosition = ref<CameraPosition>();
    //  Giro3D camera3D.position is *not always* the same as orbitControls.getPosition()
    const camera3dPosition = ref<Vector3>(new Vector3());
    const navigationMode = ref<NavigationMode>('orbit');
    const _isUserInteracting = ref<boolean>(false);

    /** Gets the current camera position and parameters */
    function getCameraPosition(): CameraPosition {
        if (cameraPosition.value === undefined) {
            throw new Error('Cannot get cameraPosition');
        }
        return cameraPosition.value;
    }

    /** Gets the "real" camera position */
    function getCamera3dPosition(): Vector3 {
        return camera3dPosition.value;
    }

    /** Sets the camera position (e.g. from bookmark) */
    function setCameraPosition(pos: CameraPosition): void {
        cameraPosition.value = pos;
    }

    /** Sets the camera position internally (after being updated) */
    function setCurrentPosition(pos: CameraPosition, position3d: Vector3): void {
        cameraPosition.value = pos;
        camera3dPosition.value.copy(position3d);
    }

    /** Gets the navigation mode */
    function getNavigationMode(): NavigationMode {
        return navigationMode.value;
    }

    function getNavigationModeRef(): Ref<NavigationMode> {
        return navigationMode;
    }

    /** Updates the navigation mode */
    function setNavigationMode(mode: NavigationMode): void {
        navigationMode.value = mode;
    }

    /** Gets wether the user is interacting with the controls or not */
    function isUserInteracting(): boolean {
        return _isUserInteracting.value;
    }

    /** Sets whether the user is interacting */
    function setIsUserInteracting(value: boolean): void {
        _isUserInteracting.value = value;
    }

    /** Moves the camera to look to an object from top-down with a smooth transition */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function lookTopDownAt(obj: Box3 | Entity3D | Object3D): void {
        // Nothing to do, rely on action listeners.
    }

    return {
        getCamera3dPosition,
        getCameraPosition,
        getNavigationMode,
        getNavigationModeRef,
        isUserInteracting,
        lookTopDownAt,
        setCameraPosition,
        setCurrentPosition,
        setIsUserInteracting,
        setNavigationMode,
    };
});
