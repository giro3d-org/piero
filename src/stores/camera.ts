import CameraPosition from "@/types/CameraPosition";
import NavigationMode from "@/types/NavigationMode";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useCameraStore = defineStore('camera', () => {
    const cameraPosition = ref<CameraPosition>();
    const navigationMode = ref<NavigationMode>('orbit');

    function getCameraPosition(): CameraPosition {
        const json: Record<string, any> = {};
        json.title = 'foo';
        const pos = cameraPosition.value.camera;
        const target = cameraPosition.value.target;
        const fo = cameraPosition.value.focalOffset;
        json.position = {
            x: pos.x,
            y: pos.y,
            z: pos.z,
        }
        json.target = {
            x: target.x,
            y: target.y,
            z: target.z,
        }
        json.focalOffset = {
            x: fo.x,
            y: fo.y,
            z: fo.z,
        }
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
        console.log('changing navigation mode to ' + mode);
    }

    return {
        getCameraPosition,
        setCameraPosition,
        setCurrentPosition,
        getNavigationMode,
        setNavigationMode,
    }
});