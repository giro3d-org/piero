<script setup lang="ts">
    import { computed, ref } from 'vue';

    import type { WidgetProps } from '@/api/widgets';

    import ButtonWithIcon from '@/components/atoms/ButtonWithIcon.vue';
    import { useDatasetStore } from '@/stores/datasets';
    import { Datagroup, type Dataset, type DatasetOrGroup } from '@/types/Dataset';
    import { nonNull } from '@/utils/types';

    // Even though we are not using them, it
    // is to conform to the expected widget interface.
    defineProps<WidgetProps>();

    const store = useDatasetStore();

    const attributions = computed(() => getAttributions(store.getVisibleDatasets()));

    function getAttributions(datasets: DatasetOrGroup[]): string[] {
        const attributions = datasets
            .filter(ds => ds.visible && !Datagroup.isGroup(ds) && ds.config.attribution != null)
            .map(ds => nonNull((ds as Dataset).config.attribution));

        const unique = new Set(attributions);

        return [...unique];
    }

    const showAttributions = ref(false);
</script>

<template>
    <div class="area">
        <ButtonWithIcon
            title="Show attributions and copyrights"
            icon="bi-info-lg"
            class="btn-light button border"
            @click="() => (showAttributions = !showAttributions)"
        />

        <div v-if="showAttributions && attributions.length > 0" class="list rounded text-muted">
            <span v-bind:key="attribution" v-for="attribution in attributions">{{
                attribution
            }}</span>
        </div>
    </div>
</template>

<style scoped>
    .area {
        display: flex;
        position: absolute;
        bottom: 0;
        left: 0;
        margin: 5pt;
        width: auto;
    }

    .button {
        width: 20pt;
        height: 20pt;
        padding: 0;
    }

    .list {
        font-size: small;
        display: flex;
        background-color: rgba(255, 255, 255, 0.8);
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
