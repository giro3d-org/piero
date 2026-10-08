<script setup lang="ts">
    import PanelHeader from '@/components/panels/PanelHeader.vue';
    import { useAnalysisStore } from '@/stores/analysis';

    import ToolWrapper from './analysis/ToolWrapper.vue';
    import EmptyIndicator from './EmptyIndicator.vue';

    const analysis = useAnalysisStore();
</script>

<template>
    <PanelHeader title="Analysis" />

    <EmptyIndicator
        text="No analysis tool"
        v-if="analysis.getTools().length === 0"
        class="flex-grow-1"
    />

    <div
        v-if="analysis.getTools().length > 0"
        class="accordion flex-grow-1 overflow-auto"
        id="analysis-accordion"
    >
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
</template>

<style scoped>
    .warning {
        justify-content: center;
        text-align: center;
    }
</style>
