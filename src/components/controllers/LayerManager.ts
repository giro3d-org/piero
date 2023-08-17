import Instance from "@giro3d/giro3d/core/Instance";
import Coordinates from "@giro3d/giro3d/core/geographic/Coordinates";
import Extent from "@giro3d/giro3d/core/geographic/Extent";
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer";
import ElevationLayer from "@giro3d/giro3d/core/layer/ElevationLayer";
import Map from "@giro3d/giro3d/entities/Map";
import { EventDispatcher } from "three";

export default class LayerManager extends EventDispatcher {
    private readonly instance: Instance;
    private readonly basemap: Map;

    constructor(instance: Instance) {
        super();

        this.instance = instance;

        const center = new Coordinates('EPSG:4326', 4.84, 45.76).as(instance.referenceCrs).xyz();
        const extent = Extent.fromCenterAndSize(instance.referenceCrs, { x: center.x, y: center.y }, 30000, 30000);

        this.basemap = new Map('basemaps', {
            extent,
            hillshading: {
                enabled: true,
                elevationLayersOnly: true,
            },
            segments: 128,
            backgroundColor: 'white',
        })

        instance.add(this.basemap);
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
}