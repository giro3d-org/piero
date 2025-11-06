import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import OpenLayersMinimapComponent from './minimap/OpenLayersMinimapComponent.vue';

export default class OpenLayersMinimap implements Module {
    public readonly id: string = 'builtin-minimap-openlayers';
    public readonly name: string = 'Minimap';

    public initialize(context: PieroContext): Promise<void> | void {
        context.widgets.addWidget({
            component: OpenLayersMinimapComponent,
            id: 'minimap-ol',
        });
    }
}
