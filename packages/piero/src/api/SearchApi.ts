import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

import type { SearchStore } from '@/stores/search';

export interface LocationSearchResult extends SearchResult {
    coordinates: Coordinates;
}

export interface SearchApi {
    registerProvider(provider: SearchProvider): void;
}

export interface SearchProvider<T extends SearchResult = SearchResult> {
    /**
     * The name of the provider, as displayed in the search results.
     */
    name: string;
    /**
     * Executes a search for the specified query string.
     */
    search(query: string): Promise<T[]>;
}

export interface SearchResult {
    /**
     * The label to display in the search results.
     */
    label: string;
    /**
     * The search provider used to perform the search.
     */
    provider: SearchProvider;
}

export class SearchApiImpl implements SearchApi {
    public constructor(private readonly searchStore: SearchStore) {}

    public registerProvider(provider: SearchProvider): void {
        this.searchStore.registerProvider(provider);
    }
}

export function isLocationSearchResult(result: SearchResult): result is LocationSearchResult {
    return (result as LocationSearchResult).coordinates instanceof Coordinates;
}
