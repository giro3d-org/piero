import type { Component } from 'vue';

import type { AnalysisStore } from '@/stores/analysis';

export interface AnalysisApi {
    registerTool(params: AnalysisToolRegistrationParams): void;
}

export type AnalysisToolRegistrationParams = {
    component: Component;
    icon: string;
    name: string;
};

/** @internal */
export class AnalysisApiImpl implements AnalysisApi {
    public constructor(private readonly store: AnalysisStore) {}

    public registerTool(params: AnalysisToolRegistrationParams): void {
        this.store.registerTool(params);
    }
}
