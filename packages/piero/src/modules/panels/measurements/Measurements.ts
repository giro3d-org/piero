import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import MeasurementPanel from './MeasurementPanel.vue';

export default class Measurements implements Module {
    public readonly id = 'builtin-panel-measurements';
    public readonly name = 'Measurement panel';

    public initialize(context: PieroContext): Promise<void> | void {
        context.panels.register({
            component: MeasurementPanel,
            icon: 'bi-rulers',
            id: 'measurements',
            title: 'Measurement',
        });
    }
}
