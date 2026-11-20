import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import PreferencePanel from './PreferencePanel.vue';

export default class Preferences implements Module {
    public readonly id = 'builtin-panel-preferences';
    public readonly name = 'Preferences panel';

    public initialize(context: PieroContext): Promise<void> | void {
        context.panels.register({
            component: PreferencePanel,
            icon: 'bi-gear',
            id: 'preferences',
            location: 'bottom',
            title: 'Preferences',
        });
    }
}
