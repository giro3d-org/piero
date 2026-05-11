import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import AttributionWidget from './AttributionWidget.vue';

export default class Attribution implements Module {
    public readonly id = 'builtin-attribution';
    public readonly name = 'Attribution';

    public initialize(context: PieroContext): Promise<void> | void {
        context.widgets.addWidget({
            component: AttributionWidget,
            id: 'attribution',
        });
    }
}
