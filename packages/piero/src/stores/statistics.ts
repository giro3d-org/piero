import type { Dataset } from '@/types/Dataset';
import { defineStore } from 'pinia';

export const useStatisticsStore = defineStore('statistics', () => {
    function getCompatibleDatasets(): Dataset[] {
        const result: Dataset[] = [];
        return result;
    }

    return { getCompatibleDatasets };
});
