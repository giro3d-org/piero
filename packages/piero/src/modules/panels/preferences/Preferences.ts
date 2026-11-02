import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import type { PreferencesStore } from './store';

import PreferencePanel from './PreferencePanel.vue';
import { usePreferenceStore } from './store';

function updateTheme(store: PreferencesStore): void {
    const body = document.getElementsByTagName('body')[0];
    const theme = store.getTheme();
    body.setAttribute('data-bs-theme', theme);
}

export default class Preferences implements Module {
    public readonly id = 'builtin-panel-preferences';
    public readonly name = 'Preferences panel';

    public initialize(context: PieroContext): Promise<void> | void {
        const store = usePreferenceStore();

        context.panels.register({
            component: PreferencePanel,
            icon: 'bi-gear',
            id: 'preferences',
            location: 'bottom',
            title: 'Preferences',
        });

        updateTheme(store);

        store.$onAction(({ after, name }) => {
            after(() => {
                switch (name) {
                    case 'setUserTheme':
                        updateTheme(store);
                        break;
                }
            });
        });
    }
}
