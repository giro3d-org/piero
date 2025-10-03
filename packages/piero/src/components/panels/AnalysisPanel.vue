<script setup lang="ts">
    import { useAnalysisStore } from '@/stores/analysis';

    import ToolWrapper from './analysis/ToolWrapper.vue';

    const analysis = useAnalysisStore();
</script>

<template>
    <div class="accordion" id="analysis-accordion">
        <ToolWrapper
            v-for="item in analysis.getTools()"
            :id="item.id"
            :key="item.id"
            :title="item.name"
            :icon="item.icon"
            :collapsible="item.collapsible"
        >
            <component :is="item.component" />
        </ToolWrapper>
    </div>

    <div v-if="analysis.getTools().length === 0" class="warning">No analysis tool registered.</div>
</template>

<style scoped>
    .warning {
        justify-content: center;
        text-align: center;
    }
</style>
