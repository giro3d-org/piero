import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import AnalysisPanel from './AnalysisPanel.vue';

export default class Analysis implements Module {
    public readonly id = 'builtin-panel-annotations';
    public readonly name = 'Annotations panel';

    public initialize(context: PieroContext): Promise<void> | void {
        context.panels.register({
            component: AnalysisPanel,
            icon: 'bi-graph-up',
            id: 'analysis',
            title: 'Analysis',
        });
    }
}
