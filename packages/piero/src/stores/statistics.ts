import { defineStore } from 'pinia';

import type { Dataset } from '@/types/Dataset';

export const useStatisticsStore = defineStore('statistics', () => {
    function getCompatibleDatasets(): Dataset[] {
        const result: Dataset[] = [];
        return result;
    }

    return { getCompatibleDatasets };
});
