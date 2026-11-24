import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import Panel from './SettingsPanel.vue';

export default class Settings implements Module {
    public readonly id = 'builtin-panel-preferences';
    public readonly name = 'Preferences panel';

    public initialize(context: PieroContext): Promise<void> | void {
        context.panels.register({
            component: Panel,
            icon: 'bi-gear',
            id: 'preferences',
            location: 'bottom',
            title: 'Preferences',
        });
    }
}
