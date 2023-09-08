import { defineStore } from "pinia";
import { ref } from "vue";

export const useAnalysisStore = defineStore('analysis', () => {
    const floodingPlaneHeight = ref(170);
    const floodingPlaneVisible = ref(false);

    function setFloodingPlaneVisible(visible: boolean) {
        floodingPlaneVisible.value = visible;
    }

    function setFloodingPlaneHeight(height: number) {
        floodingPlaneHeight.value = height;
    }


    return { floodingPlaneHeight, floodingPlaneVisible, setFloodingPlaneVisible, setFloodingPlaneHeight, }
});