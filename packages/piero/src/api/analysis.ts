import type { Component } from 'vue';

import type { AnalysisStore } from '@/stores/analysis';

export type AnalysisToolRegistrationParams = {
    component: Component;
    icon: string;
    name: string;
};

export class AnalysisApiImpl implements AnalysisApi {
    public constructor(private readonly store: AnalysisStore) {}

    public registerTool(params: AnalysisToolRegistrationParams): void {
        this.store.registerTool(params);
    }
}

export default interface AnalysisApi {
    registerTool(params: AnalysisToolRegistrationParams): void;
}
