import { defineStore } from 'pinia';
import { computed, shallowRef } from 'vue';

import type { SearchProvider } from '@/api/SearchApi';

export const useSearchStore = defineStore('search', () => {
    const providers = shallowRef<SearchProvider[]>([]);
    const searchProviderCount = computed(() => providers.value.length);

    function registerProvider(provider: SearchProvider): void {
        if (!providers.value.includes(provider)) {
            providers.value.push(provider);
        }
    }

    function getProviders(): SearchProvider[] {
        return [...providers.value];
    }

    return {
        getProviders,
        registerProvider,
        searchProviderCount,
    };
});

export type SearchStore = ReturnType<typeof useSearchStore>;
