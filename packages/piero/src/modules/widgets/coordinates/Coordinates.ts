import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import Widget from './CoordinatesWidget.vue';

export default class Coordinates implements Module {
    public readonly id: string = 'builtin-coordinates';
    public readonly name: string = 'Coordinates';

    public initialize(context: PieroContext): Promise<void> {
        context.widgets.addWidget({
            component: Widget,
            id: this.id,
        });

        return Promise.resolve();
    }
}
