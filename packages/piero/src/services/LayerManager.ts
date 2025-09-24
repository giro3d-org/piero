import type Extent from '@giro3d/giro3d/core/geographic/Extent';
import type Instance from '@giro3d/giro3d/core/Instance';
import type Layer from '@giro3d/giro3d/core/layer/Layer';

import { isColorLayer } from '@giro3d/giro3d/core/layer/ColorLayer';
import Giro3dMap from '@giro3d/giro3d/entities/Map';
import { EventDispatcher } from 'three';

import { useGiro3dStore } from '@/stores/giro3d';

interface LayerConfig {
    zOrder: number;
}

export default class LayerManager extends EventDispatcher {
    public get extent(): Extent {
        return this._map.extent;
    }

    private readonly _giro3dStore = useGiro3dStore();
    private readonly _instance: Instance;
    private readonly _layers: Map<Layer['id'], LayerConfig>;
    private readonly _map: Giro3dMap;

    public constructor(instance: Instance) {
        super();

        this._instance = instance;
        this._layers = new Map();

        const extent = this._giro3dStore.getDefaultBasemapExtent();
        const mapOptions = this._giro3dStore.getDefaultBasemapOptions();

        this._map = new Giro3dMap({
            extent: extent.as(instance.referenceCrs),
            ...mapOptions,
        });
        this._map.terrain.segments = 32;
        this._map.name = 'basemaps';
        this._instance.add(this._map).catch(console.error);
    }

    public async addLayer(layer: Layer, zOrder: number): Promise<void> {
        this._layers.set(layer.id, { zOrder });
        await this._map.addLayer(layer);
        this.updateLayerOrdering();
    }

    public dispose(): void {
        this._instance.remove(this._map);
        this._map.dispose({ disposeLayers: true });
    }

    public getBasemap(): Giro3dMap {
        return this._map;
    }

    public notify(layer: Layer): void {
        this._instance.notifyChange(layer);
    }

    public removeLayer(layer: Layer): void {
        this._layers.delete(layer.id);
        this._map.removeLayer(layer, { disposeLayer: true });
        this._instance.notifyChange(this._map);
    }

    public setLayerOpacity(layer: Layer, opacity: number): void {
        if (isColorLayer(layer)) {
            if (layer.opacity !== opacity) {
                layer.opacity = opacity;
                this._instance.notifyChange(layer);
            }
        }
    }
    public setLayerVisibility(layer: Layer, visible: boolean): void {
        layer.visible = visible;
        this.updateLayerOrdering();
    }

    public setMapOpacity(opacity: number): void {
        this._map.opacity = opacity;
        this._instance.notifyChange(this._map);
    }

    private updateLayerOrdering(): void {
        const order = [...this._layers.entries()]
            .sort((a, b) => b[1].zOrder - a[1].zOrder)
            .map(ent => ent[0]);

        this._map.sortColorLayers((a: Layer, b: Layer) => {
            const orderA = order.indexOf(a.id);
            const orderB = order.indexOf(b.id);
            if (orderA >= 0 && orderB >= 0) {
                return orderA - orderB;
            }
            return 0;
        });
    }
}
