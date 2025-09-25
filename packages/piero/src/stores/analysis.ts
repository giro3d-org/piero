import type { Component, Ref, ShallowRef } from 'vue';

import { defineStore } from 'pinia';
import { generateUUID } from 'three/src/math/MathUtils.js';
import { ref, shallowRef } from 'vue';

import type { AnalysisToolRegistrationParams } from '@/api/AnalysisApi';

type AnalysisTool = {
    collapsible: boolean;
    component: ShallowRef<Component>;
    icon: string;
    id: string;
    name: string;
};

type ToolState = {
    expanded: boolean;
};

export const useAnalysisStore = defineStore('analysis', () => {
    const _tools: Ref<AnalysisTool[]> = ref([]);
    const _toolStates = ref<Record<AnalysisTool['id'], ToolState>>({});

    const _enableStatistics = ref(false);

    function enableStatistics(enable: boolean): void {
        _enableStatistics.value = enable;
    }

    function isStatisticsEnabled(): boolean {
        return _enableStatistics.value;
    }

    function registerTool(tool: AnalysisToolRegistrationParams): void {
        const item: AnalysisTool = {
            collapsible: true,
            component: shallowRef(tool.component),
            icon: tool.icon,
            id: generateUUID(),
            name: tool.name,
        };

        _tools.value.push(item);

        const newStates = {
            ..._toolStates.value,
        };

        newStates[item.id] = { expanded: false };

        _toolStates.value = newStates;
    }

    function expandTool(id: AnalysisTool['id'], enabled: boolean): void {
        _toolStates.value[id].expanded = enabled;
    }

    function isToolExpanded(id: AnalysisTool['id']): boolean {
        return _toolStates.value[id].expanded;
    }

    function getTools(): AnalysisTool[] {
        return _tools.value;
    }

    return {
        enableStatistics,
        expandTool,

        getTools,
        isStatisticsEnabled,
        isToolExpanded,
        registerTool,
    };
});

export type AnalysisStore = ReturnType<typeof useAnalysisStore>;
