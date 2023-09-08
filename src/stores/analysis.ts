import { defineStore } from "pinia";
import { ref } from "vue";

export const useAnalysisStore = defineStore('analysis', () => {
    const floodingPlaneHeight = ref(170);
    const _enableFloodingPlane = ref(false);
    const _enableCrossSection = ref(false);

    function setFloodingPlaneHeight(height: number) {
        floodingPlaneHeight.value = height;
    }

    function enableFloodingPlane(enable: boolean) {
        _enableFloodingPlane.value = enable;
    }

    function isFloodingPlaneEnabled() {
        return _enableFloodingPlane.value
    }

    function enableCrossSection(enable: boolean) {
        _enableCrossSection.value = enable;
    }

    function isCrossSectionEnabled() {
        return _enableCrossSection.value
    }

    return { floodingPlaneHeight, enableFloodingPlane, isFloodingPlaneEnabled, setFloodingPlaneHeight, enableCrossSection, isCrossSectionEnabled }
});