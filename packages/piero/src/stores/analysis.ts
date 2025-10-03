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

export const useAnalysisStore = defineStore('analysis', () => {
    const _tools: Ref<AnalysisTool[]> = ref([]);

    function registerTool(tool: AnalysisToolRegistrationParams): void {
        const item: AnalysisTool = {
            collapsible: true,
            component: shallowRef(tool.component),
            icon: tool.icon,
            id: generateUUID(),
            name: tool.name,
        };

        _tools.value.push(item);
    }

    function getTools(): AnalysisTool[] {
        return _tools.value;
    }

    return {
        getTools,
        registerTool,
    };
});

export type AnalysisStore = ReturnType<typeof useAnalysisStore>;
