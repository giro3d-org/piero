import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGraticuleStore = defineStore('graticule', () => {
    const opacity = ref(0.5);

    const setOpacity = (v: number): void => {
        opacity.value = v;
    };

    return {
        opacity,
        setOpacity,
    };
});

export type GraticuleStore = ReturnType<typeof useGraticuleStore>;
