import { defineStore } from "pinia";
import { Vector3 } from "three";
import { ref } from "vue";
import config from '../config.json';

export const useAnalysisStore = defineStore('analysis', () => {
    const floodingPlaneHeight = ref(170);
    const crossSectionOrientation = ref(0);
    const center = config.analysis.clipping_planes.pivot;
    const crossSectionCenter = ref(new Vector3(center.x, center.y, 0));
    const _enableFloodingPlane = ref(false);
    const _enableCrossSection = ref(false);
    const _enableStatistics = ref(false);

    function setFloodingPlaneHeight(height: number) {
        floodingPlaneHeight.value = height;
    }

    function enableFloodingPlane(enable: boolean) {
        _enableFloodingPlane.value = enable;
    }

    function isFloodingPlaneEnabled() {
        return _enableFloodingPlane.value
    }

    function enableStatistics(enable: boolean) {
        _enableStatistics.value = enable;
    }

    function isStatisticsEnabled() {
        return _enableStatistics.value
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
        isStatisticsEnabled,
        enableStatistics,
        enableCrossSection,
        isCrossSectionEnabled,
        setCrossSectionOrientation,
        setCrossSectionCenter,
     }
});