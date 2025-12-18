import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBasemapStore = defineStore('basemap', () => {
    const visible = ref(true);
    const opacity = ref(1);

    const setVisible = (v: boolean): void => {
        visible.value = v;
    };

    const setOpacity = (v: number): void => {
        opacity.value = v;
    };

    return {
        opacity,
        setOpacity,
        setVisible,
        visible,
    };
});

export type useBasemapStore = ReturnType<typeof useBasemapStore>;
