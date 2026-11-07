<script setup lang="ts">
    import type Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

    import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem';
    // @ts-expect-error autocomplete-vue does not provide typing
    import Autocomplete from '@trevoreyre/autocomplete-vue';

    import { isLocationSearchResult, type SearchResult } from '@/api/search';
    import Icon from '@/components/atoms/Icon.vue';
    import { useSearchStore } from '@/stores/search';

    const emits = defineEmits<{
        resultSelected: [value: SearchResult];
    }>();

    const store = useSearchStore();

    function formatDMS(coord: Coordinates): string {
        const wgs84 = coord.as(CoordinateSystem.epsg4326);

        return `lat: ${wgs84.latitude}° lon: ${wgs84.longitude}°`;
    }

    function getResultValue(result: SearchResult): string {
        return result.label;
    }

    async function search(query: string): Promise<SearchResult[]> {
        if (query.length < 3) {
            return Promise.resolve([]);
        }

        const providers = store.getProviders();

        const promises = providers.map(p => p.search(query));

        const allResults = await Promise.all(promises);

        return allResults.flatMap(x => x);
    }

    function submitResult(result: SearchResult): void {
        emits('resultSelected', result);
    }
</script>

<template>
    <div class="main">
        <autocomplete
            :debounceTime="500"
            :search="search"
            :getResultValue="getResultValue"
            @submit="submitResult"
            id="search-place-autocomplete"
            placeholder="Search..."
        >
            <template #result="{ result, props }">
                <li v-bind="props" class="autocomplete-result result overflow-hidden my-2">
                    <div class="row">
                        <span class="col-auto ms-3 my-auto text-primary"
                            ><Icon icon="fg-poi" title="Location"
                        /></span>
                        <div
                            :title="result.label"
                            class="col-auto text-truncate"
                            style="max-width: 80%"
                        >
                            <span class="text-sm">{{ result.label }}</span>
                            <p
                                class="text-muted provider fw-lighter my-0"
                                v-if="isLocationSearchResult(result)"
                            >
                                {{ formatDMS(result.coordinates) }}
                            </p>
                            <!-- <p class="provider fw-lighter text-muted">{{ result.provider.name }}</p> -->
                        </div>
                    </div>
                    <div class="wiki-snippet" :v-html="result.snippet"></div>
                </li>
            </template>
        </autocomplete>
    </div>
</template>

<style lang="css">
    .autocomplete-input {
        background-color: var(--bs-body-bg) !important;
        border: solid 1px var(--bs-secondary) !important;
        height: 2.5rem;
    }
    .autocomplete-result {
        background-color: var(--bs-body-bg) !important;
        border: solid 0px var(--bs-secondary) !important;
    }
    .autocomplete-result-list {
        background-color: var(--bs-body-bg) !important;
        border: solid 1px var(--bs-secondary) !important;
    }
</style>

<style scoped lang="css">
    .main {
        padding-top: 0.5rem;
        font-size: small;
    }

    .result {
        padding: 2pt;
        background: transparent;
    }

    .provider {
        font-size: 12px;
        margin: 0;
    }

    .result:hover {
        background: lightgray;
    }

    .result-type {
        padding-left: 5pt;
        padding-right: 6pt;
    }

    .result-label {
        font-size: 14px;
    }
</style>
