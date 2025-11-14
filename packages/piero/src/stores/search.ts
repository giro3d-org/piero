import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

import type { SearchProvider } from '@/api/SearchApi';

export const useSearchStore = defineStore('search', () => {
    const providers = shallowRef<SearchProvider[]>([]);

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
    };
});

export type SearchStore = ReturnType<typeof useSearchStore>;
