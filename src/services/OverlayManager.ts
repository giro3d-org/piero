import Instance from '@giro3d/giro3d/core/Instance';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';

import { useLayerStore } from '@/stores/layers';
import LayerManager from '@/services/LayerManager.js';
import LayerBuilder from '@/giro3d/LayerBuilder';
import { ImageSource } from '@giro3d/giro3d/sources';
import { Overlay } from '@/types/Overlay';

export default class OverlayManager {
    private readonly layerManager: LayerManager;
    private readonly layers: Map<string, ColorLayer> = new Map();
    private readonly store = useLayerStore();
    private readonly instance: Instance;

    constructor(layerManager: LayerManager, instance: Instance) {
        this.layerManager = layerManager;
        this.instance = instance;

        const overlayList = [...this.store.getOverlays()].reverse();

        for (const overlay of overlayList) {
            if (overlay.visible) {
                this.loadOverlay(overlay);
            }
        }

        this.store.$onAction(({ name, args, after }) => {
            after(() => {
                switch (name) {
                    case 'setOverlayOpacity':
                        this.onOpacityChanged(args[0], args[1]);
                        break;
                    case 'setOverlayVisibility':
                        this.onVisibilityChanged(args[0], args[1]);
                        break;
                    case 'moveOverlayDown':
                        this.onMoveDown(args[0]);
                        break;
                    case 'moveOverlayUp':
                        this.onMoveUp(args[0]);
                        break;
                }
            });
        });
    }

    dispose() {
        // Nothing to do
    }

    onMoveUp(overlay: Overlay) {
        const index = this.store.getOverlays().indexOf(overlay);

        if (index > 0) {
            const layer = this.layers.get(overlay.uuid);
            if (layer) this.layerManager.moveOverlayUp(layer);
        }
    }

    onMoveDown(overlay: Overlay) {
        const index = this.store.getOverlays().indexOf(overlay);

        if (index < this.store.overlayCount) {
            const layer = this.layers.get(overlay.uuid);
            if (layer) this.layerManager.moveOverlayDown(layer);
        }
    }

    async onOpacityChanged(overlay: Overlay, newOpacity: number) {
        const id = overlay.uuid;
        let layer = this.layers.get(id);

        if (!layer) {
            layer = await this.loadOverlay(overlay);
        }

        if (layer) {
            layer.opacity = newOpacity;
            this.layerManager.notify(layer);
        }
    }

    private async getSource(overlay: Overlay): Promise<ImageSource> {
        return LayerBuilder.getSource(overlay.config.source);
    }

    private async loadOverlay(overlay: Overlay) {
        const layer = new ColorLayer({
            name: overlay.name,
            source: await this.getSource(overlay),
            extent: this.layerManager.extent,
        });
        this.layers.set(overlay.uuid, layer);
        this.layerManager.addOverlay(layer);
        layer.visible = overlay.visible;
        layer.opacity = overlay.opacity;

        return layer;
    }

    async onVisibilityChanged(overlay: Overlay, newVisibility: boolean) {
        const id = overlay.uuid;
        let layer = this.layers.get(id);

        if (newVisibility && !layer) {
            layer = await this.loadOverlay(overlay);
        }

        if (layer) {
            layer.visible = newVisibility;
            this.layerManager.notify(layer);
        }
    }
}
