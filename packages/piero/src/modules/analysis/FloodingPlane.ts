import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import FloodingPlaneComponent from './floodingPlane/FloodingPlane.vue';
import FloodingPlaneManager from './floodingPlane/FloodingPlaneManager';

/**
 * An analysis module that displays a flooding plane with variable altitude.
 */
export default class FloodingPlane implements Module {
    public readonly id = 'builtin-analysis-flooding-plane';
    public readonly name = 'Flooding plane';

    private _manager: FloodingPlaneManager | null = null;

    public initialize(context: PieroContext): void {
        context.analysis.registerTool({
            component: FloodingPlaneComponent,
            icon: 'bi-layers-half',
            name: 'Flooding plane',
        });

        this._manager = new FloodingPlaneManager(context);
    }
}
