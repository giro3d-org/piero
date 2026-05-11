import type Instance from '@giro3d/giro3d/core/Instance';

import { defineStore } from 'pinia';
import { Vector3 } from 'three';
import { ref, shallowRef } from 'vue';

import type SceneCursorManager from '@/services/SceneCursorManager';

export const useCrossSectionStore = defineStore('crossSection', () => {
    const orientation = ref(0);
    const instance = shallowRef<Instance>();
    const cursorManager = shallowRef<SceneCursorManager>();
    const center = ref(new Vector3(0, 0, 0));
    const enable = ref(false);
    const showHelper = ref(false);

    function setEnabled(v: boolean): void {
        enable.value = v;
    }

    function setOrientation(v: number): void {
        orientation.value = v;
    }

    function setCenter(v: Vector3): void {
        center.value = v;
    }

    function setShowHelper(v: boolean): void {
        showHelper.value = v;
    }

    function setInstance(v: Instance): void {
        instance.value = v;
    }

    function setCursorManager(v: SceneCursorManager): void {
        cursorManager.value = v;
    }

    return {
        center,
        cursorManager,
        enable,
        instance,
        orientation,
        setCenter,
        setCursorManager,
        setEnabled,
        setInstance,
        setOrientation,
        setShowHelper,
        showHelper,
    };
});

export type CrossSectionStore = ReturnType<typeof useCrossSectionStore>;
