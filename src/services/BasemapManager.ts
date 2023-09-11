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
import { WMTSCapabilities } from 'ol/format'
import { WMTS, XYZ } from 'ol/source'
import { optionsFromCapabilities } from 'ol/source/WMTS'
import { OpenLayersUtils } from '@giro3d/giro3d/utils'
import Interpretation from '@giro3d/giro3d/core/layer/Interpretation'

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

const colorMap = createColorMap('RdYlBu', 0, 5000);

function loadElevationLayerFromMapbox(layerManager: LayerManager, id: string) {
    const key = 'pk.eyJ1IjoidG11Z3VldCIsImEiOiJjbGJ4dTNkOW0wYWx4M25ybWZ5YnpicHV6In0.KhDJ7W5N3d1z3ArrsDjX_A';
    const layer = new ElevationLayer(id, {
            source: new TiledImageSource({
                source: new XYZ({
                    url: `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=${key}`,
                    projection: 'EPSG:3857',
                    crossOrigin: 'anonymous',
                }),
            }),
            minmax: { min: 0, max: 5000 },
            interpretation: Interpretation.MapboxTerrainRGB,
            colorMap,
        },
    );

    layerManager.addElevationLayer(layer);

    return layer;
}

async function loadElevationLayerFromAltimetryWMS(layerManager: LayerManager, id: string) {
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

    const layer = new ElevationLayer(id, {
        source: new TiledImageSource({ source, format, noDataValue }),
        minmax: { min: 0, max: 5000 },
        noDataValue,
        colorMap,
    });

    layerManager.addElevationLayer(layer);

    return layer;
}

async function loadElevationLayerFromAltimetryWMTS(layerManager: LayerManager, id: string) {
    const noDataValue = -1000;
    const format = new BilFormat();

    const source = await createWMTSSource(
        'ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES',
        'https://wxs.ign.fr/altimetrie/geoportail/wmts?SERVICE=WMTS&REQUEST=GetCapabilities',
        'image/x-bil;bits=32',
        'LAMB93',
    );

    const layer = new ElevationLayer(id, {
        source: new TiledImageSource({ source, format, noDataValue }),
        minmax: { min: 0, max: 5000 },
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

async function createWMTSSource(layer: string, url: string, format?: string, matrixSet?: string) {
    const parser = new WMTSCapabilities();

    return fetch(url)
        .then(res => {
            return res.text();
        }).then(text => {
            const result = parser.read(text);
            const options = optionsFromCapabilities(result, {
              layer,
            //   matrixSet: matrixSet ?? 'EPSG:3857',
              projection: 'EPSG:3857',
              format,
            });
            return new WMTS(options);
        });
}

async function loadImageryLayer(layerManager: LayerManager, id: string) {
    const source = await createWMTSSource(
        'ORTHOIMAGERY.ORTHOPHOTOS',
        'https://wxs.ign.fr/essentiels/geoportail/wmts?SERVICE=WMTS&REQUEST=GetCapabilities',
    );

    const tiledSource = new TiledImageSource({ source });

    // FIXME in Giro3D we use the extent of the tilegrid which seems incorrect in this case
    tiledSource.sourceExtent = OpenLayersUtils.fromOLExtent([
        -20037508.342789244,
        -20037508.342789244,
        20037508.342789244,
        20037508.342789244
    ], 'EPSG:3857');

    const colorLayer = new ColorLayer(id, {
        source: tiledSource,
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

    private async loadBasemap(basemap: Basemap) {
        let layer: Layer;
        switch (basemap.id) {
            case 'elevation':
                layer = loadElevationLayerFromMapbox(this.layerManager, 'elevation');
                break;
            case 'imagery':
                layer = await loadImageryLayer(this.layerManager, 'imagery')
                break;
            case 'osm':
                layer = loadOSMLayer(this.layerManager, 'osm');
                break;
        }

        this.layers.set(basemap.id, layer);

        layer.visible = basemap.visible;
        if (layer.type === 'ColorLayer') {
            (layer as ColorLayer).opacity = basemap.opacity;
        }

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
            this.loadBasemap(basemap);
            return null;
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
