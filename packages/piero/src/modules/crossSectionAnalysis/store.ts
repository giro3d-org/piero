import type Instance from '@giro3d/giro3d/core/Instance';

import { defineStore } from 'pinia';
import { Vector3 } from 'three';
import { ref } from 'vue';

export const useCrossSectionStore = defineStore('crossSection', () => {
    const orientation = ref(0);
    const instance = ref<Instance>();
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

    function setInstance(v: Instance): void {
        instance.value = v;
    }

    return {
        center,
        enable,
        instance,
        orientation,
        setCenter,
        setEnabled,
        setInstance,
        setOrientation,
    };
});

export type CrossSectionStore = ReturnType<typeof useCrossSectionStore>;
