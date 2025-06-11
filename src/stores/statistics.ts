import type { Dataset } from '@/types/Dataset';
import { defineStore } from 'pinia';
import { useDatasetStore } from './datasets';

export const useStatisticsStore = defineStore('statistics', () => {
    function getCompatibleDatasets(): Dataset[] {
        const datasets = useDatasetStore();

        const result: Dataset[] = [];
        for (const ds of datasets.getDatasets()) {
            if (ds.type === 'ifc') {
                result.push(ds);
            }
        }
        return result;
    }

    return { getCompatibleDatasets };
});
