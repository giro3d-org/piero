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
    private readonly instance: Instance;
    private readonly cameraStore = useCameraStore();
    private readonly giro3dStore = useGiro3dStore();
    private readonly layerStore = useLayerStore();
    private readonly basemap: Giro3dMap;
    private readonly grid: Grid;
    private readonly plane: Plane;

    private readonly baseLayers: Map<string, Layer>;
    private readonly overlays: Map<string, ColorLayer>;

    private readonly _boundOnAfterCameraUpdate: () => void;

    constructor(instance: Instance) {
        super();

        this.instance = instance;
        this.baseLayers = new Map();
        this.overlays = new Map();

        const extent = this.giro3dStore.getDefaultBasemapExtent();

        this.basemap = new Giro3dMap('basemaps', {
            extent,
            hillshading: {
                enabled: true,
                elevationLayersOnly: true,
            },
            doubleSided: true,
            segments: 128,
            backgroundColor: 'white',
        });
        this.instance.add(this.basemap);

        this.grid = new Grid(this.instance, extent, GRID_NAME);
        this.plane = new Plane(this.instance, extent, PLANE_NAME);

        this._boundOnAfterCameraUpdate = this.onAfterCameraUpdate.bind(this);
        this.instance.addEventListener('after-camera-update', this._boundOnAfterCameraUpdate);

        for (const overlay of this.layerStore.getOverlays()) {
            if (overlay.visible) {
                this.loadOverlay(overlay);
            }
        }

        for (const basemap of this.layerStore.getBasemaps()) {
            if (basemap.visible) {
                this.loadBasemap(basemap);
            }
        }

        this.layerStore.$onAction(({ name, args, after }) => {
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
        this.instance.removeEventListener('after-camera-update', this._boundOnAfterCameraUpdate);

        this.instance.remove(this.basemap);
        this.plane.dispose();
        this.grid.dispose();
        this.basemap.dispose({ disposeLayers: true });
    }

    private onAfterCameraUpdate() {
        const pos = this.cameraStore.getCamera3dPosition();
        const oldVisible = this.grid.visible;
        const newVisible = pos.z < GRID_ALTITUDE_THRESHOLD;

        if (oldVisible !== newVisible) {
            this.grid.visible = newVisible;
            this.plane.visible = newVisible;
        }
    }

    notify(layer: Layer) {
        this.instance.notifyChange(layer);
    }

    get extent() {
        return this.basemap.extent;
    }

    setMapOpacity(opacity: number) {
        this.basemap.opacity = opacity;
        this.instance.notifyChange(this.basemap);
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
                    colorMap: this.layerStore.getElevationColorMap(),
                    noDataOptions: {
                        replaceNoData: false,
                    },
                });
                layer.addEventListener('visible-property-changed', () => {
                    this.basemap.visible = layer.visible;
                    this.instance.notifyChange(this.basemap);
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

        this.baseLayers.set(basemap.uuid, layer);
        this.basemap.addLayer(layer);
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

        this.overlays.set(overlay.uuid, layer);
        this.basemap.addLayer(layer);
        this.updateLayerOrdering();

        layer.visible = overlay.visible;
        layer.opacity = overlay.opacity;

        return layer;
    }

    private async getLayer(basemap: BaseLayer, load: boolean = true): Promise<Layer | undefined> {
        const layer = this.baseLayers.get(basemap.uuid);
        if (!layer && load) {
            return this.loadBasemap(basemap);
        }
        return layer;
    }

    private async getOverlay(
        overlay: Overlay,
        load: boolean = true,
    ): Promise<ColorLayer | undefined> {
        const layer = this.overlays.get(overlay.uuid);
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
            ...this.layerStore
                .getBasemaps()
                .map(layer => this.baseLayers.get(layer.uuid)?.id)
                .reverse(),
            // And then overlays, still in the reverse order,
            // So that the first overlay in the config is the last one in the list
            ...this.layerStore
                .getOverlays()
                .map(layer => this.overlays.get(layer.uuid)?.id)
                .reverse(),
        ];

        this.basemap.sortColorLayers((a: Layer, b: Layer) => {
            const orderA = order.indexOf(a.id);
            const orderB = order.indexOf(b.id);
            if (orderA >= 0 && orderB >= 0) return orderA - orderB;
            return 0;
        });
    }
}
