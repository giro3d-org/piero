<script setup lang="ts">
    import { useAnalysisStore } from '@/stores/analysis';
    import ClippingBox from './analysis/ClippingBox.vue';
    import CrossSection from './analysis/CrossSection.vue';
    import FloodingPlane from './analysis/FloodingPlane.vue';
    import Statistics from './analysis/Statistics.vue';
    import ToolWrapper from './analysis/ToolWrapper.vue';

    const analysis = useAnalysisStore();
</script>

<template>
    <div>
        <ToolWrapper
            class="tool"
            id="flooding-plane"
            title="Flooding plane"
            icon="bi-layers-half"
            :expanded="analysis.isFloodingPlaneEnabled()"
            :collapsible="true"
            @update:expanded="analysis.enableFloodingPlane"
        >
            <FloodingPlane />
        </ToolWrapper>

        <ToolWrapper
            class="tool"
            id="cross-section"
            title="Cross section"
            icon="bi-circle-half"
            :expanded="analysis.isCrossSectionEnabled()"
            :collapsible="true"
            @update:expanded="analysis.enableCrossSection"
        >
            <CrossSection />
        </ToolWrapper>

        <ToolWrapper
            class="tool"
            id="clipping-box"
            title="Clipping Box"
            icon="bi-bounding-box"
            :expanded="analysis.isClippingBoxEnabled()"
            :collapsible="true"
            @update:expanded="analysis.enableClippingBox"
        >
            <ClippingBox />
        </ToolWrapper>

        <ToolWrapper
            class="tool"
            id="statistics"
            title="Statistics"
            icon="bi-bar-chart-line"
            :expanded="analysis.isStatisticsEnabled()"
            :collapsible="true"
            @update:expanded="analysis.enableStatistics"
        >
            <Statistics />
        </ToolWrapper>
    </div>
</template>

<style scoped>
    .tool {
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
        margin-top: 1rem;
    }
</style>
