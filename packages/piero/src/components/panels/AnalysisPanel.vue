<script setup lang="ts">
    import { useAnalysisStore } from '@/stores/analysis';

    import ToolWrapper from './analysis/ToolWrapper.vue';

    const analysis = useAnalysisStore();
</script>

<template>
    <div>
        <ToolWrapper
            class="tool"
            v-for="item in analysis.getTools()"
            :id="item.id"
            :key="item.id"
            :title="item.name"
            :icon="item.icon"
            :expanded="analysis.isToolExpanded(item.id)"
            :collapsible="item.collapsible"
            @update:expanded="x => analysis.expandTool(item.id, x)"
        >
            <component :is="item.component" />
        </ToolWrapper>

        <div v-if="analysis.getTools().length === 0" class="warning">
            No analysis tool registered.
        </div>
    </div>
</template>

<style scoped>
    .tool {
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
        margin-top: 1rem;
    }

    .warning {
        justify-content: center;
        text-align: center;
    }
</style>
