import Instance from "@giro3d/giro3d/core/Instance";
import Coordinates from "@giro3d/giro3d/core/geographic/Coordinates";
import Extent from "@giro3d/giro3d/core/geographic/Extent";
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer";
import ElevationLayer from "@giro3d/giro3d/core/layer/ElevationLayer";
import Layer from "@giro3d/giro3d/core/layer/Layer";
import Map from "@giro3d/giro3d/entities/Map";
import { Feature } from "ol";
import { EventDispatcher } from "three";
import NotificationController from "./NotificationController";

export default class LayerManager extends EventDispatcher {
    private readonly instance: Instance;
    private readonly overlays: ColorLayer[] = [];
    private basemap: Map;

    constructor(instance: Instance) {
        super();

        this.instance = instance;

        const center = new Coordinates('EPSG:4326', 4.84, 45.76).as(instance.referenceCrs).xyz();
        const extent = Extent.fromCenterAndSize(instance.referenceCrs, { x: center.x, y: center.y }, 30000, 30000);

        this.createMap(extent);
    }

    setExtent(extent: Extent) {
        const layers = this.basemap.getLayers();
        this.instance.remove(this.basemap);
        this.createMap(extent, layers);
    }

    private createMap(extent: Extent, layers?: Layer[]) {
        this.basemap = new Map('basemaps', {
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

        NotificationController.showNotification('Basemaps', 'Basemaps created');

        if (layers) {
            for (const layer of layers) {
                this.basemap.addLayer(layer);
            }
        }
    }

    notify(layer: Layer) {
        this.instance.notifyChange(layer);
    }

    get extent() {
        return this.basemap.extent;
    }

    addElevationLayer(layer: ElevationLayer) {
        this.basemap.addLayer(layer);
    }

    addBaseLayer(layer: ColorLayer) {
        this.basemap.addLayer(layer);
    }

    addOverlay(layer: ColorLayer) {
        this.overlays.push(layer);
        this.basemap.addLayer(layer);
    }

    moveOverlayDown(overlay: ColorLayer) {
        this.basemap.moveLayerDown(overlay);
    }

    moveOverlayUp(overlay: ColorLayer) {
        this.basemap.moveLayerUp(overlay);
    }
}