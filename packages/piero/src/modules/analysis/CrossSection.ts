import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import CrossSectionComponent from './crossSection/CrossSection.vue';
import CrossSectionManager from './crossSection/CrossSectionManager';

/**
 * An analysis module that displays a cross section.
 */
export default class CrossSection implements Module {
    public readonly id = 'builtin-analysis-cross-section';
    public readonly name = 'Cross section';

    private _manager: CrossSectionManager | null = null;

    public initialize(context: PieroContext): void {
        context.analysis.registerTool({
            component: CrossSectionComponent,
            icon: 'bi-circle-half',
            name: 'Cross section',
        });

        this._manager = new CrossSectionManager(context);
    }
}
