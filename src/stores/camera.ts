import CameraPosition from "@/types/CameraPosition";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useCameraStore = defineStore('camera', () => {
    const cameraPosition = ref<CameraPosition>();

    function getCameraPosition(): CameraPosition {
        return cameraPosition.value;
    }

    function setCameraPosition(pos: CameraPosition) {
        cameraPosition.value = pos;
    }

    function setCurrentPosition(pos: CameraPosition) {
        cameraPosition.value = pos;
    }

    return { getCameraPosition, setCameraPosition, setCurrentPosition }
});