<script setup lang="ts">
    // @ts-expect-error autocomplete-vue does not provide typing
    import Autocomplete from '@trevoreyre/autocomplete-vue';

    import type { SearchResult } from '@/api';

    import Icon from '@/components/atoms/Icon.vue';
    import { useSearchStore } from '@/stores/search';

    const emits = defineEmits<{
        resultSelected: [value: SearchResult];
    }>();

    const store = useSearchStore();

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
                <li v-bind="props" class="autocomplete-result result">
                    <div class="result-label">
                        <span class="result-type"><Icon icon="fg-poi" title="Location" /></span>
                        <span>{{ result.label }}</span>
                        <p class="provider">{{ result.provider.name }}</p>
                    </div>
                    <div class="wiki-snippet" :v-html="result.snippet"></div>
                </li>
            </template>
        </autocomplete>
    </div>
</template>

<style scoped>
    .main {
        padding-top: 0.5rem;
    }

    input {
        height: 30pt;
        box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
    }

    .autocomplete {
        width: 100%;
    }

    .result {
        border-top: 1px solid #eee;
        padding: 16px;
        background: transparent;
    }

    .provider {
        font-size: 12px;
        opacity: 60%;
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
