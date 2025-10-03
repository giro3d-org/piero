import { defineStore } from 'pinia';
import { Vector3 } from 'three';
import { ref } from 'vue';

export const useCrossSectionStore = defineStore('crossSection', () => {
    const orientation = ref(0);
    const center = ref(new Vector3(0, 0, 0));
    const enable = ref(false);

    function setEnabled(v: boolean): void {
        enable.value = v;
    }

    function setOrientation(v: number): void {
        orientation.value = v;
    }

    function setCenter(v: Vector3): void {
        center.value = v;
    }

    return {
        center,
        enable,
        orientation,
        setCenter,
        setEnabled,
        setOrientation,
    };
});

export type CrossSectionStore = ReturnType<typeof useCrossSectionStore>;
