import Instance from '@giro3d/giro3d/core/Instance';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer'

import { Overlay } from "@/types/Overlay"
import { useLayerStore } from '@/stores/layers';
import LayerManager from '@/services/LayerManager.js'

export default class OverlayManager {
    private readonly layerManager: LayerManager;
    private readonly layers: Map<string, ColorLayer> = new Map();
    private readonly store = useLayerStore();

    constructor(layerManager: LayerManager, instance: Instance) {
        this.layerManager = layerManager;

        const overlayList = [...this.store.getOverlays()].reverse();

        for (const overlay of overlayList) {
            if (overlay.source) {
                const layer = new ColorLayer(overlay.name, { source: overlay.source(instance) })
                this.layers.set(overlay.id, layer);
                this.layerManager.addOverlay(layer);
                layer.visible = overlay.visible;
                layer.opacity = overlay.opacity;
            }
        }

        this.store.$onAction(({
            name,
            args,
            after
        }) => {
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

    onMoveUp(overlay: Overlay) {
        const index = this.store.getOverlays().indexOf(overlay);

        if (index > 0) {
            this.layerManager.moveOverlayUp(this.layers.get(overlay.id));
        }
    }

    onMoveDown(overlay: Overlay) {
        const index = this.store.getOverlays().indexOf(overlay);

        if (index < this.store.overlayCount) {
            this.layerManager.moveOverlayDown(this.layers.get(overlay.id));
        }
    }

    onOpacityChanged(overlay: Overlay, newOpacity: number) {
        const id = overlay.id;
        const layer = this.layers.get(id);
        layer.opacity = newOpacity;
        this.layerManager.notify(layer);
    }

    onVisibilityChanged(overlay: Overlay, newVisibility: boolean) {
        const id = overlay.id;
        const layer = this.layers.get(id);
        layer.visible = newVisibility;
        this.layerManager.notify(layer);
    }
}
