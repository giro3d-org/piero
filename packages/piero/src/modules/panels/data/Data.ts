import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import DatasetPanel from './DatasetPanel.vue';

export default class Data implements Module {
    public readonly id = 'builtin-panel-data';
    public readonly name = 'Data panel';

    public initialize(context: PieroContext): Promise<void> | void {
        context.panels.register({
            component: DatasetPanel,
            icon: 'bi-stack',
            id: 'data',
            title: 'Data',
        });
    }
}
