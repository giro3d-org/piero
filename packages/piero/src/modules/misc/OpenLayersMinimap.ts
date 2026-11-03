import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import { ConfigurationSchema } from './minimap/config';
import MinimapWidget from './minimap/MinimapWidget.vue';
import { useMinimapStore } from './minimap/store';

export default class OpenLayersMinimap implements Module {
    public readonly id: string = 'builtin-minimap-openlayers';
    public readonly name: string = 'Minimap';

    public async initialize(context: PieroContext): Promise<void> {
        const configEntry = context.configuration.modules?.[this.id];

        if (configEntry != null) {
            const config = await ConfigurationSchema.parseAsync(configEntry);
            const store = useMinimapStore();
            store.setConfiguration(config);
        }

        context.widgets.addWidget({
            component: MinimapWidget,
            id: 'minimap-ol',
        });
    }
}
