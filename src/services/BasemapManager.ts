import chroma from 'chroma-js'

import OSM from 'ol/source/OSM'
import TileWMS from 'ol/source/TileWMS'

import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer'
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer'
import BilFormat from '@giro3d/giro3d/formats/BilFormat'
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource'

import LayerManager from '@/services/LayerManager'
import { useLayerStore } from '@/stores/layers'
import { Basemap } from "@/types/Basemap"
import ColorMap from '@giro3d/giro3d/core/layer/ColorMap'
import Layer from '@giro3d/giro3d/core/layer/Layer'
import { Color } from 'three'

function createColorMap(preset: string, min: number, max: number) {
    const scale = chroma.scale(preset);
    const colors = [];
    for (let i = 0; i < 256; i++) {
        const rgb = scale(i / 255).gl();
        const c = new Color(rgb[0], rgb[1], rgb[2]);
        colors.push(c);
    }
    return new ColorMap(colors, min, max);
}

function loadElevationLayer(layerManager: LayerManager, id: string) {
    const source = new TileWMS({
        url: 'https://wxs.ign.fr/altimetrie/geoportail/r/wms',
        projection: layerManager.extent.crs(),
        crossOrigin: 'anonymous',
        params: {
            LAYERS: ['ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES'],
            FORMAT: 'image/x-bil;bits=32',
            VERSION: '1.3.0',
        },
    });
    const noDataValue = -1000;
    const format = new BilFormat();

    const colorMap = createColorMap('RdYlBu', 0, 600);

    const layer = new ElevationLayer(id, {
        source: new TiledImageSource({ source, format, noDataValue }),
        minmax: { min: 0, max: 600 },
        noDataValue,
        colorMap,
    });

    layerManager.addElevationLayer(layer);

    return layer;
}

function loadOSMLayer(layerManager: LayerManager, id: string) {
    const layer = new ColorLayer(id, {
        source: new TiledImageSource({ source: new OSM() }),
    });

    layer.visible = false;

    layerManager.addBaseLayer(layer);

    return layer;
}

function loadImageryLayer(layerManager: LayerManager, id: string) {
    // Create a WMS imagery layer
    // TODO use WMTS version for faster loading
    const wmsOthophotoSource = new TiledImageSource({
        source: new TileWMS({
            url: 'https://wxs.ign.fr/ortho/geoportail/r/wms',
            projection: 'EPSG:2154',
            params: {
                LAYERS: ['HR.ORTHOIMAGERY.ORTHOPHOTOS'],
                FORMAT: 'image/jpeg',
            },
        }),
    });

    const colorLayer = new ColorLayer(id, {
        source: wmsOthophotoSource,
    },
    );

    layerManager.addBaseLayer(colorLayer);

    return colorLayer;
}

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

    private loadBasemap(basemap: Basemap) {
        let layer: Layer;
        switch (basemap.id) {
            case 'elevation':
                layer = loadElevationLayer(this.layerManager, 'elevation');
                break;
            case 'imagery':
                layer = loadImageryLayer(this.layerManager, 'imagery')
                break;
            case 'osm':
                layer = loadOSMLayer(this.layerManager, 'osm');
                break;
        }

        this.layers.set(basemap.id, layer);

        return layer;
    }

    onOpacityChanged(basemap: Basemap, newOpacity: number) {
        const layer = this.getLayer(basemap);
        if (layer && layer.type === 'ColorLayer') {
            (layer as ColorLayer).opacity = newOpacity;
            this.layerManager.notify(layer);
        }
    }

    private getLayer(basemap: Basemap) {
        let layer = this.layers.get(basemap.id);
        if (!layer) {
            layer = this.loadBasemap(basemap);
        }
        return layer;
    }

    onVisibilityChanged(basemap: Basemap, newVisibility: boolean) {
        const layer = this.getLayer(basemap);
        if (layer) {
            layer.visible = newVisibility;
            this.layerManager.notify(layer);
        }
    }
}
