<script setup lang="ts">
    import BanProvider from '@/providers/BanProvider';
    import { type GeocodingResult } from '@/providers/Geocoding';
    // @ts-expect-error autocomplete does not provide typing
    import autoComplete from '@tarekraafat/autocomplete.js';
    import { onMounted, ref } from 'vue';

    const inputField = ref<HTMLInputElement | null>(null);

    const emits = defineEmits(['update:poi']);

    onMounted(() => {
        new autoComplete({
            selector: '#search-place-autocomplete',
            placeHolder: 'Search places...',
            threshold: 3,
            debounce: 300, // 300ms debounce
            data: {
                src: async (query: string) => {
                    return await BanProvider.geocode(query);
                },
                keys: ['label'],
            },
            resultsList: {
                noResults: true,
            },
            resultItem: {
                highlight: true,
            },
            // Trust what we get from the query
            searchEngine: (query: string, record: unknown) => record,
        });

        const inputElement = inputField.value as HTMLInputElement;

        inputElement.addEventListener('selection', (event: Event) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const poi = (event as any).detail.selection.value as GeocodingResult;

            emits('update:poi', poi);
        });
    });
</script>

<template>
    <div class="main">
        <div class="input-group" id="address-search">
            <input
                ref="inputField"
                id="search-place-autocomplete"
                class="rounded-pill form-control"
                type="search"
                dir="ltr"
                placeholder="Search places..."
                spellcheck="false"
                autocorrect="off"
                autocomplete="off"
                autocapitalize="off"
                maxlength="2048"
                tabindex="1"
            />
        </div>
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
</style>
