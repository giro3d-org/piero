import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import AboutPanel from './AboutPanel.vue';

export default class About implements Module {
    public readonly id = 'builtin-panel-about';
    public readonly name = 'About panel';

    public initialize(context: PieroContext): Promise<void> | void {
        context.panels.register({
            component: AboutPanel,
            icon: 'bi-info-circle',
            id: 'about',
            title: 'About Piero',
        });
    }
}
