
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer'
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer'

import LayerManager from '@/services/LayerManager'
import { useLayerStore } from '@/stores/layers'
import { BaseLayer } from "@/types/BaseLayer"
import Layer from '@giro3d/giro3d/core/layer/Layer'
import LayerBuilder from '@/giro3d/LayerBuilder'

/**
 * Service responsible of maintaining the visual representation of basemaps in the Giro3D view.
 */
export default class BasemapManager {
    private readonly layerManager: LayerManager;
    private readonly layers: Map<string, Layer>;
    private readonly store = useLayerStore();

    constructor(layerManager: LayerManager) {
        this.layerManager = layerManager;
        this.layers = new Map();

        this.store.$onAction(({
            name,
            args,
            after
        }) => {
            after(() => {
                switch (name) {
                    case 'setBasemapVisibility':
                        this.onVisibilityChanged(args[0], args[1]);
                        break;
                    case 'setBasemapOpacity':
                        this.onOpacityChanged(args[0], args[1]);
                        break;
                }
            });
        });

        for (const basemap of this.store.getBasemaps()) {
            if (basemap.visible) {
                this.loadBasemap(basemap);
            }
        }
    }

    private async loadBasemap(basemap: BaseLayer) {
        let layer: Layer;
        const source = await LayerBuilder.getSource(basemap.source);
        switch (basemap.type) {
            case 'elevation':
                layer = new ElevationLayer({
                    name: basemap.uuid,
                    source,
                    minmax: { min: 0, max: 5000 },
                    colorMap: this.store.getElevationColorMap(),
                });
                this.layerManager.addElevationLayer(layer as ElevationLayer);
                break;
            case 'color':
                layer = new ColorLayer({
                    name: basemap.uuid,
                    source,
                });
                this.layerManager.addBaseLayer(layer as ColorLayer);
                break;
        }

        this.layers.set(basemap.uuid, layer);

        layer.visible = basemap.visible;
        if (layer.type === 'ColorLayer') {
            (layer as ColorLayer).opacity = basemap.opacity;
        }

        return layer;
    }

    onOpacityChanged(basemap: BaseLayer, newOpacity: number) {
        const layer = this.getLayer(basemap);
        if (layer && layer.type === 'ColorLayer') {
            (layer as ColorLayer).opacity = newOpacity;
            this.layerManager.notify(layer);
        }
        if (layer && layer.type === 'ElevationLayer') {
            this.layerManager.setMapOpacity(basemap.opacity);
        }
    }

    private getLayer(basemap: BaseLayer) {
        const layer = this.layers.get(basemap.uuid);
        if (!layer) {
            this.loadBasemap(basemap);
            return null;
        }
        return layer;
    }

    onVisibilityChanged(basemap: BaseLayer, newVisibility: boolean) {
        const layer = this.getLayer(basemap);
        if (layer) {
            layer.visible = newVisibility;
            this.layerManager.notify(layer);
        }
    }
}
