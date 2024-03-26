import Instance from '@giro3d/giro3d/core/Instance';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import Layer from '@giro3d/giro3d/core/layer/Layer';
import Giro3dMap from '@giro3d/giro3d/entities/Map';
import { EventDispatcher } from 'three';
import { useCameraStore } from '@/stores/camera';
import { useGiro3dStore } from '@/stores/giro3d';
import { useLayerStore } from '@/stores/layers';
import { Overlay } from '@/types/Overlay';
import { BaseLayer, isColorLayer, isElevationLayer } from '@/types/BaseLayer';
import LayerBuilder from '@/giro3d/LayerBuilder';
import Grid from '@/giro3d/Grid';
import Plane from '@/giro3d/Plane';

// Hide the grid when above this altitude threshold
const GRID_ALTITUDE_THRESHOLD = 3000;
export const GRID_NAME = 'grid';
export const PLANE_NAME = 'plane';

export default class LayerManager extends EventDispatcher {
    private readonly _instance: Instance;
    private readonly _cameraStore = useCameraStore();
    private readonly _giro3dStore = useGiro3dStore();
    private readonly _layerStore = useLayerStore();
    private readonly _basemap: Giro3dMap;
    private readonly _grid: Grid;
    private readonly _plane: Plane;

    private readonly _baseLayers: Map<string, Layer>;
    private readonly _overlays: Map<string, ColorLayer>;

    private readonly _boundOnAfterCameraUpdate: () => void;

    constructor(instance: Instance) {
        super();

        this._instance = instance;
        this._baseLayers = new Map();
        this._overlays = new Map();

        const extent = this._giro3dStore.getDefaultBasemapExtent();

        this._basemap = new Giro3dMap('basemaps', {
            extent,
            hillshading: {
                enabled: true,
                elevationLayersOnly: true,
            },
            doubleSided: true,
            segments: 128,
            backgroundColor: 'white',
        });
        this._instance.add(this._basemap);

        this._grid = new Grid(this._instance, extent, GRID_NAME);
        this._plane = new Plane(this._instance, extent, PLANE_NAME);

        this._boundOnAfterCameraUpdate = this.onAfterCameraUpdate.bind(this);
        this._instance.addEventListener('after-camera-update', this._boundOnAfterCameraUpdate);

        for (const overlay of this._layerStore.getOverlays()) {
            if (overlay.visible) {
                this.loadOverlay(overlay);
            }
        }

        for (const basemap of this._layerStore.getBasemaps()) {
            if (basemap.visible) {
                this.loadBasemap(basemap);
            }
        }

        this._layerStore.$onAction(({ name, args, after }) => {
            after(() => {
                switch (name) {
                    case 'setBasemapVisibility':
                        this.onLayerVisibilityChanged(args[0], args[1]);
                        break;
                    case 'setBasemapOpacity':
                        this.onLayerOpacityChanged(args[0], args[1]);
                        break;
                    case 'setOverlayOpacity':
                        this.onOverlayOpacityChanged(args[0], args[1]);
                        break;
                    case 'setOverlayVisibility':
                        this.onOverlayVisibilityChanged(args[0], args[1]);
                        break;
                    case 'moveOverlayDown':
                    case 'moveOverlayUp':
                        this.onOverlayReordered(args[0]);
                        break;
                }
            });
        });
    }

    dispose() {
        this._instance.removeEventListener('after-camera-update', this._boundOnAfterCameraUpdate);

        this._instance.remove(this._basemap);
        this._plane.dispose();
        this._grid.dispose();
        this._basemap.dispose({ disposeLayers: true });
    }

    private onAfterCameraUpdate() {
        const pos = this._cameraStore.getCamera3dPosition();
        const oldVisible = this._grid.visible;
        const newVisible = pos.z < GRID_ALTITUDE_THRESHOLD;

        if (oldVisible !== newVisible) {
            this._grid.visible = newVisible;
            this._plane.visible = newVisible;
        }
    }

    notify(layer: Layer) {
        this._instance.notifyChange(layer);
    }

    get extent() {
        return this._basemap.extent;
    }

    setMapOpacity(opacity: number) {
        this._basemap.opacity = opacity;
        this._instance.notifyChange(this._basemap);
    }

    private async loadBasemap(basemap: BaseLayer) {
        let layer: Layer;
        const source = await LayerBuilder.getSource(basemap.source);
        switch (basemap.type) {
            case 'elevation':
                layer = new ElevationLayer({
                    name: basemap.uuid,
                    source,
                    resolutionFactor: basemap.source.resolution,
                    minmax: { min: 0, max: 5000 },
                    colorMap: this._layerStore.getElevationColorMap(),
                    noDataOptions: {
                        replaceNoData: false,
                    },
                });
                layer.addEventListener('visible-property-changed', () => {
                    this._basemap.visible = layer.visible;
                    this._instance.notifyChange(this._basemap);
                });
                break;
            case 'color':
                layer = new ColorLayer({
                    name: basemap.uuid,
                    source,
                    resolutionFactor: basemap.source.resolution,
                });
                break;
            default: {
                // Exhaustiveness checking
                const _exhaustiveCheck: never = basemap.type;
                return _exhaustiveCheck;
            }
        }

        this._baseLayers.set(basemap.uuid, layer);
        this._basemap.addLayer(layer);
        this.updateLayerOrdering();

        layer.visible = basemap.visible;
        if (isColorLayer(layer)) {
            layer.opacity = basemap.opacity;
        }

        return layer;
    }

    private async loadOverlay(overlay: Overlay) {
        const source = await LayerBuilder.getSource(overlay.config.source);
        const layer = new ColorLayer({
            name: overlay.name,
            source,
            extent: this.extent,
        });

        this._overlays.set(overlay.uuid, layer);
        this._basemap.addLayer(layer);
        this.updateLayerOrdering();

        layer.visible = overlay.visible;
        layer.opacity = overlay.opacity;

        return layer;
    }

    private async getLayer(basemap: BaseLayer, load: boolean = true): Promise<Layer | undefined> {
        const layer = this._baseLayers.get(basemap.uuid);
        if (!layer && load) {
            return this.loadBasemap(basemap);
        }
        return layer;
    }

    private async getOverlay(
        overlay: Overlay,
        load: boolean = true,
    ): Promise<ColorLayer | undefined> {
        const layer = this._overlays.get(overlay.uuid);
        if (!layer && load) {
            return this.loadOverlay(overlay);
        }
        return layer;
    }

    onOverlayReordered(overlay: Overlay) {
        if (overlay.visible) {
            this.updateLayerOrdering();
        }
    }

    async onLayerOpacityChanged(basemap: BaseLayer, newOpacity: number) {
        const layer = await this.getLayer(basemap);
        if (layer && isColorLayer(layer)) {
            layer.opacity = newOpacity;
            this.notify(layer);
        }
        if (layer && isElevationLayer(layer)) {
            this.setMapOpacity(basemap.opacity);
        }
    }

    async onOverlayOpacityChanged(overlay: Overlay, newOpacity: number) {
        const layer = await this.getOverlay(overlay);
        if (layer) {
            layer.opacity = newOpacity;
            this.notify(layer);
        }
    }

    async onLayerVisibilityChanged(basemap: BaseLayer, newVisibility: boolean) {
        const layer = await this.getLayer(basemap, newVisibility);
        if (layer) {
            layer.visible = newVisibility;
            this.notify(layer);
        }
    }

    async onOverlayVisibilityChanged(overlay: Overlay, newVisibility: boolean) {
        const layer = await this.getOverlay(overlay, newVisibility);
        if (layer) {
            layer.visible = newVisibility;
            this.notify(layer);
        }
    }

    private updateLayerOrdering() {
        // We'll sort layers in the counter-intuitive way:
        // - first one will be the bottom one
        // - last one will be the top one
        // In other words, reverse order from what you'd expect in the UI
        const order = [
            // Put basemap layers first, in the reverse order of the config
            // So that the last basemap layer in the config is the first one in the list
            ...this._layerStore
                .getBasemaps()
                .map(layer => this._baseLayers.get(layer.uuid)?.id)
                .reverse(),
            // And then overlays, still in the reverse order,
            // So that the first overlay in the config is the last one in the list
            ...this._layerStore
                .getOverlays()
                .map(layer => this._overlays.get(layer.uuid)?.id)
                .reverse(),
        ];

        this._basemap.sortColorLayers((a: Layer, b: Layer) => {
            const orderA = order.indexOf(a.id);
            const orderB = order.indexOf(b.id);
            if (orderA >= 0 && orderB >= 0) return orderA - orderB;
            return 0;
        });
    }
}
