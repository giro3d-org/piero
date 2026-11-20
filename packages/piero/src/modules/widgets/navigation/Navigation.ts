import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import Widget from './NavigationWidget.vue';

export default class Navigation implements Module {
    public readonly id = 'builtin-navigation';
    public readonly name = 'Navigation';

    public initialize(context: PieroContext): Promise<void> | void {
        context.widgets.addWidget({
            component: Widget,
            id: this.id,
        });
    }
}
