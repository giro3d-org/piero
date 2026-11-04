<script setup lang="ts">
    import { computed, ref } from 'vue';

    import type { WidgetProps } from '@/api/widgets';

    import { useDatasetStore } from '@/stores/datasets';
    import { type Dataset } from '@/types/Dataset';
    import { nonNull } from '@/utils/Types';

    // Even though we are not using them, it
    // is to conform to the expected widget interface.
    defineProps<WidgetProps>();

    const store = useDatasetStore();

    const attributions = computed(() => getAttributions(store.getVisibleDatasets()));

    function getAttributions(datasets: Dataset[]): string[] {
        const attributions = datasets
            .filter(ds => ds.config.attribution != null)
            .map(ds => nonNull(ds.config.attribution));

        const unique = new Set(attributions);

        return [...unique];
    }

    const showAttributions = ref(false);
</script>

<template>
    <div class="area">
        <button
            title="Show attributions and copyrights"
            :class="['btn', 'button', showAttributions ? 'border' : undefined]"
            @click="() => (showAttributions = !showAttributions)"
        >
            <i class="bi bi-info-lg" />
        </button>

        <div
            v-if="showAttributions && attributions.length > 0"
            class="background ms-2 badge border text-muted"
        >
            <span v-bind:key="attribution" v-for="attribution in attributions">{{
                attribution
            }}</span>
        </div>
    </div>
</template>

<style scoped>
    .background {
        background-color: var(--bs-body-bg);
        color: var(--bs-body-color);
    }

    .area {
        position: absolute;
        bottom: 0;
        left: 0;
        margin: 5pt;
        width: auto;
    }

    .button {
        width: 20pt;
        background-color: var(--bs-body-bg);
        height: 20pt;
        padding: 0;
    }

    .button:hover {
        background-color: var(--bs-body-bg);
    }

    .list {
        font-size: small;
        display: flex;
        width: auto;
        padding: 3pt;
        padding-left: 5pt;
        margin-left: 4pt;
        height: auto;
    }

    span::after {
        content: ', ';
        margin-right: 2pt;
    }

    span:last-child::after {
        content: '';
    }
</style>
