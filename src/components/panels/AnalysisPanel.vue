<script setup>
import { useAnalysisStore } from '@/stores/analysis';
import FloodingPlane from './analysis/FloodingPlane.vue'
import ToolWrapper from './analysis/ToolWrapper.vue';
import CrossSection from './analysis/CrossSection.vue';

const analysis = useAnalysisStore();
</script>

<template>
    <div>
        <ToolWrapper class="tool" title="Flooding plane" :enabled="analysis.isFloodingPlaneEnabled()" @update:enabled="analysis.enableFloodingPlane">
            <FloodingPlane />
        </ToolWrapper>

        <ToolWrapper class="tool" title="Cross section" :enabled="analysis.isCrossSectionEnabled()" @update:enabled="analysis.enableCrossSection">
            <CrossSection />
        </ToolWrapper>
    </div>
</template>

<style scoped>
.tool {
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    margin-top: 1rem;
}
</style>