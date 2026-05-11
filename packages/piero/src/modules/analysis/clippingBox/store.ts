import { defineStore } from 'pinia';
import { Box3, Vector3 } from 'three';
import { ref } from 'vue';

export const useClippingBoxStore = defineStore('clippingBox', () => {
    const orientation = ref(0);
    const center = ref(new Vector3(0, 0, 0));
    const size = ref(new Vector3(0, 0, 0));
    const enable = ref(false);
    const invert = ref(false);
    const displayHelper = ref(false);
    const clippingBox = ref(new Box3().setFromCenterAndSize(center.value, size.value));

    function _recomputeClippingBox(): void {
        clippingBox.value = new Box3().setFromCenterAndSize(center.value, size.value);
    }

    function setEnabled(v: boolean): void {
        enable.value = v;
    }

    function setInverted(v: boolean): void {
        invert.value = v;
    }
    function setOrientation(v: number): void {
        orientation.value = v;
    }

    function setCenter(v: Vector3): void {
        center.value = v;
        _recomputeClippingBox();
    }

    function setSize(v: Vector3): void {
        size.value = v;
        _recomputeClippingBox();
    }

    function setDisplayHelper(v: boolean): void {
        displayHelper.value = v;
    }

    function setClippingBox(box: Box3): void {
        clippingBox.value = box.clone();
        const newCenter = new Vector3();
        const newSize = new Vector3();
        box.getCenter(newCenter);
        box.getSize(newSize);
        center.value = newCenter;
        size.value = newSize;
    }

    return {
        center,
        clippingBox,
        displayHelper,
        enable,
        invert,
        orientation,
        setCenter,
        setClippingBox,
        setDisplayHelper,
        setEnabled,
        setInverted,
        setOrientation,
        setSize,
        size,
    };
});

export type ClippingBoxStore = ReturnType<typeof useClippingBoxStore>;
