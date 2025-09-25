import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import CrossSection from './crossSectionAnalysis/CrossSection.vue';
import CrossSectionManager from './crossSectionAnalysis/CrossSectionManager';

/**
 * An analysis module that displays a cross section.
 */
export default class CrossSectionAnalysis implements Module {
    public readonly id = 'builtin-cross-section-analysis';
    public readonly name = 'Cross section';

    private _manager: CrossSectionManager | null = null;

    public initialize(context: PieroContext): void {
        context.analysis.registerTool({
            component: CrossSection,
            icon: 'bi-circle-half',
            name: 'Cross section',
        });

        this._manager = new CrossSectionManager(context);
    }
}
