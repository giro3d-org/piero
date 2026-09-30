import { defineStore } from 'pinia';
import { ref } from 'vue';

import { ALL_DATASET_TYPES_KEYWORD } from '@/constants';

export const useDatasetPanelStore = defineStore('datasetPanel', () => {
    const searchQuery = ref('');
    const searchText = ref('');
    const typeFilter = ref(ALL_DATASET_TYPES_KEYWORD);
    const doFilterByCamera = ref(false);
    const filterExpanded = ref(false);

    return {
        doFilterByCamera,
        filterExpanded,
        searchQuery,
        searchText,
        typeFilter,
    };
});
