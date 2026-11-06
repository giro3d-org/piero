import { defineStore } from 'pinia';
import { ref } from 'vue';

import { ALL_DATASET_TYPES_KEYWORD } from '@/constants';

export const useDatasetPanelStore = defineStore('datasetPanel', () => {
    const searchQuery = ref('');
    const searchText = ref('');
    const typeFilter = ref(ALL_DATASET_TYPES_KEYWORD);
    const doFilterByCamera = ref(false);
    const filterExpanded = ref(false);
    const expandedItems = ref<Set<string>>(new Set());

    function setExpanded(uuid: string, expanded: boolean): void {
        if (expanded) {
            expandedItems.value.add(uuid);
        } else {
            expandedItems.value.delete(uuid);
        }
    }

    return {
        doFilterByCamera,
        expandedItems,
        filterExpanded,
        searchQuery,
        searchText,
        setExpanded,
        typeFilter,
    };
});
