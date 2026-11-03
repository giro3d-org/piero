import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Configuration } from './config';

export const useMinimapStore = defineStore('minimap', () => {
    const configuration = ref<Configuration | null>(null);

    const setConfiguration = (config: Configuration): void => {
        configuration.value = config;
    };

    return {
        configuration,
        setConfiguration,
    };
});
