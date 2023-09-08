import { defineStore } from "pinia";
import { Vector3 } from "three";
import { ref } from "vue";

export const useAnalysisStore = defineStore('analysis', () => {
    const floodingPlaneHeight = ref(170);
    const crossSectionOrientation = ref(0);
    const crossSectionCenter = ref(new Vector3(841912, 6517810, 0));
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

    function setCrossSectionOrientation(orientation: number) {
        crossSectionOrientation.value = orientation;
    }

    function setCrossSectionCenter(center: Vector3) {
        crossSectionCenter.value = center;
    }

    return {
        floodingPlaneHeight,
        enableFloodingPlane,
        isFloodingPlaneEnabled,
        setFloodingPlaneHeight,
        crossSectionOrientation,
        crossSectionCenter,
        enableCrossSection,
        isCrossSectionEnabled,
        setCrossSectionOrientation,
        setCrossSectionCenter,
     }
});