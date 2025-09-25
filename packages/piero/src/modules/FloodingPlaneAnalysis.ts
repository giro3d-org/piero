import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import FloodingPlane from './floodingPlaneAnalysis/FloodingPlane.vue';
import FloodingPlaneManager from './floodingPlaneAnalysis/FloodingPlaneManager';

/**
 * An analysis module that displays a flooding plane with variable altitude.
 */
export default class FloodingPlaneAnalysis implements Module {
    public readonly id = 'builtin-flooding-plane-analysis';
    public readonly name = 'Flooding plane';

    private _manager: FloodingPlaneManager | null = null;

    public initialize(context: PieroContext): void {
        context.analysis.registerTool({
            component: FloodingPlane,
            icon: 'bi-layers-half',
            name: 'Flooding plane',
        });

        this._manager = new FloodingPlaneManager(context);
    }
}
