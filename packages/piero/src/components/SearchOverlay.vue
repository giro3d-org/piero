<script setup lang="ts">
    // @ts-expect-error autocomplete-vue does not provide typing
    import Autocomplete from '@trevoreyre/autocomplete-vue';

    import Icon from '@/components/atoms/Icon.vue';
    import BanProvider from '@/providers/BanProvider';
    import { type GeocodingResult } from '@/providers/Geocoding';

    const emits = defineEmits(['update:poi']);

    function getResultValue(result: GeocodingResult): string {
        return result.label;
    }

    function search(query: string): Promise<GeocodingResult[]> {
        if (query.length < 3) {
            return Promise.resolve([]);
        }
        return BanProvider.geocode(query);
    }

    function submitResult(result: GeocodingResult): void {
        emits('update:poi', result);
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
