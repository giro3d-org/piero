<script setup lang="ts">
    import DropdownView from '@/components/DropdownView.vue';
    import ButtonWithIcon from '@/components/atoms/ButtonWithIcon.vue';
    import BarChart from '@/components/charts/BarChart.vue';
    import DoughnutChart from '@/components/charts/DoughnutChart.vue';
    import LoadingIndicator from '@/components/panels/LoadingIndicator.vue';
    import { useStatisticsStore } from '@/stores/statistics';
    import type { Dataset } from '@/types/Dataset';
    import PromiseUtils from '@giro3d/giro3d/utils/PromiseUtils';
    import { ref } from 'vue';

    const store = useStatisticsStore();

    const source = ref<Dataset | null>(null);
    const isLoading = ref<boolean>(false);
    const showCharts = ref<boolean>(false);

    function setCurrentSource(src: Dataset) {
        source.value = src;
        isLoading.value = false;
        showCharts.value = false;
    }

    async function createStatistics() {
        isLoading.value = true;
        showCharts.value = false;

        // Simulate async server request
        await PromiseUtils.delay(1000);

        isLoading.value = false;
        showCharts.value = true;
    }
</script>

<template>
    <div class="mb-3">
        <DropdownView
            label="Source"
            :current="null"
            :items="store.getCompatibleDatasets()"
            @updated:current="src => setCurrentSource(src as Dataset)"
        />
    </div>
    <ButtonWithIcon
        title="Generate stats..."
        class="btn-primary"
        @click="createStatistics"
        icon="bi-pie-chart-fill"
        text="Generate"
    />

    <div class="row w-100 my-2">
        <LoadingIndicator text="processing..." v-if="isLoading" />
        <div v-if="showCharts">
            <div class="border m-2 p-1">
                <BarChart />
            </div>
            <div class="border m-2 p-1">
                <DoughnutChart />
            </div>
        </div>
    </div>
</template>

<style scoped>
    .loading-indicator {
        width: 100%;
        height: 100% !important;
        vertical-align: middle;
        font-size: large !important;
        text-align: center;
    }
</style>
