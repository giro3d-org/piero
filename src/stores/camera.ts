import CameraPosition from '@/types/CameraPosition';
import NavigationMode from '@/types/NavigationMode';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import { defineStore } from 'pinia';
import { Box3, Object3D, Vector3 } from 'three';
import { ref } from 'vue';

export const useCameraStore = defineStore('camera', () => {
    const cameraPosition = ref<CameraPosition>();
    //  Giro3D camera3D.position is *not always* the same as orbitControls.getPosition()
    const camera3dPosition = ref<Vector3>(new Vector3());
    const navigationMode = ref<NavigationMode>('orbit');
    const _isUserInteracting = ref<boolean>(false);

    /** Gets the current camera position and parameters */
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
        return cameraPosition.value;
    }

    /** Gets the "real" camera position */
    function getCamera3dPosition() {
        return camera3dPosition.value;
    }

    /** Sets the camera position (e.g. from bookmark) */
    function setCameraPosition(pos: CameraPosition) {
        cameraPosition.value = pos;
    }

    /** Sets the camera position internally (after being updated) */
    function setCurrentPosition(pos: CameraPosition, position3d: Vector3) {
        cameraPosition.value = pos;
        camera3dPosition.value.copy(position3d);
    }

    /** Gets the navigation mode */
    function getNavigationMode() {
        return navigationMode.value;
    }

    /** Updates the navigation mode */
    function setNavigationMode(mode: NavigationMode) {
        navigationMode.value = mode;
    }

    /** Gets wether the user is interacting with the controls or not */
    function isUserInteracting(): boolean {
        return _isUserInteracting.value;
    }

    /** Sets whether the user is interacting */
    function setIsUserInteracting(value: boolean) {
        _isUserInteracting.value = value;
    }

    /** Moves the camera to look to an object from top-down with a smooth transition */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function lookTopDownAt(obj: Box3 | Object3D | Entity3D) {
        // Nothing to do, rely on action listeners.
    }

    return {
        getCameraPosition,
        getCamera3dPosition,
        setCameraPosition,
        setCurrentPosition,
        getNavigationMode,
        setNavigationMode,
        isUserInteracting,
        setIsUserInteracting,
        lookTopDownAt,
    };
});
