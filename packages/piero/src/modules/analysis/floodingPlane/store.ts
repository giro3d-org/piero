import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFloodingPlaneStore = defineStore('floodingPlane', () => {
    const height = ref(0);
    const enable = ref(false);

    function getHeight(): number {
        return height.value;
    }

    function setHeight(v: number): void {
        height.value = v;
    }

    function setEnabled(v: boolean): void {
        enable.value = v;
    }

    return { enable, getHeight, setEnabled, setHeight };
});
