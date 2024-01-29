import { defineStore } from "pinia";
import { Box3, Vector3 } from "three";
import { ref } from "vue";
import config from '../config';

export const useAnalysisStore = defineStore('analysis', () => {
    const floodingPlaneHeight = ref(170);
    const _enableFloodingPlane = ref(false);

    const crossSectionOrientation = ref(config.analysis.cross_section.orientation);
    const crossSectionPivot = config.analysis.cross_section.pivot;
    const crossSectionCenter = ref(new Vector3(crossSectionPivot.x, crossSectionPivot.y, 0));
    const _enableCrossSection = ref(false);

    const { center: clippingPlanesCenter, size } = config.analysis.clipping_box;
    const clippingBoxCenter = ref(new Vector3(clippingPlanesCenter.x, clippingPlanesCenter.y, clippingPlanesCenter.z));
    const clippingBoxSize = ref(new Vector3(size.x, size.y, size.z));
    const clippingBox = ref(new Box3().setFromCenterAndSize(clippingBoxCenter.value, clippingBoxSize.value));
    const _enableClippingBox = ref(false);
    const _invertClippingBox = ref(false);
    const _displayClippingBoxHelper = ref(false);

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

    function enableClippingBox(enable: boolean) {
        _enableClippingBox.value = enable;
    }

    function isClippingBoxEnabled() {
        return _enableClippingBox.value
    }

    function _recomputeClippingBox() {
        clippingBox.value = new Box3().setFromCenterAndSize(clippingBoxCenter.value, clippingBoxSize.value);
    }

    function setClippingBoxCenter(center: Vector3) {
        clippingBoxCenter.value = center;
        _recomputeClippingBox();
    }

    function setClippingBoxSize(size: Vector3) {
        clippingBoxSize.value = size;
        _recomputeClippingBox();
    }

    function setClippingBox(box: Box3) {
        clippingBox.value = box.clone();
        const center = new Vector3();
        const size = new Vector3();
        box.getCenter(center);
        box.getSize(size);
        clippingBoxCenter.value = center;
        clippingBoxSize.value = size;
    }

    function getClippingBox(): Box3 {
        return clippingBox.value;
    }

    function displayClippingBoxHelper(display: boolean) {
        _displayClippingBoxHelper.value = display;
    }

    function isClippingBoxHelperDisplayed() {
        return _displayClippingBoxHelper.value
    }

    function setClippingBoxInverted(inverted: boolean) {
        _invertClippingBox.value = inverted;
    }

    function isClippingBoxInverted() {
        return _invertClippingBox.value
    }

    function enableStatistics(enable: boolean) {
        _enableStatistics.value = enable;
    }

    function isStatisticsEnabled() {
        return _enableStatistics.value
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

        clippingBoxCenter,
        clippingBoxSize,
        enableClippingBox,
        isClippingBoxEnabled,
        setClippingBoxCenter,
        setClippingBoxSize,
        setClippingBox,
        getClippingBox,
        displayClippingBoxHelper,
        isClippingBoxHelperDisplayed,
        setClippingBoxInverted,
        isClippingBoxInverted,

        isStatisticsEnabled,
        enableStatistics,
    }
});
