import * as chroma from 'chroma-js'

import OSM from 'ol/source/OSM'
import TileWMS from 'ol/source/TileWMS'

import BilFormat from '@giro3d/giro3d/formats/BilFormat'
import GiroMap from '@giro3d/giro3d/entities/Map'
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource'
import Extent from '@giro3d/giro3d/core/geographic/Extent'
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer'
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates'
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer'

import Basemap from "../../types/Basemap"
import LayerManager from './LayerManager'
import MainController from './MainController'
import Layer from '@giro3d/giro3d/core/layer/Layer'
import ColorMap from '@giro3d/giro3d/core/layer/ColorMap'
import { Color } from 'three'

let currentInstance;
let giroMap;
let controller: BasemapController;

MainController.onInit(ctrl => onGiro3DMounted(ctrl));

const basemaps = [
    new Basemap({ id: 'osm', name: 'OSM', type: 'color', visible: false }),
    new Basemap({ id: 'imagery', name: 'Imagery' }),
    new Basemap({ id: 'elevation', name: 'Elevation', type: 'elevation' }),
];

const layers = new Map();

function getBasemaps() {
    return basemaps;
}

function createColorMap(preset, min, max) {
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
        extent: layerManager.extent,
        minmax: { min: 0, max: 600 },
        noDataValue,
        colorMap,
    });

    layerManager.addElevationLayer(layer);

    return layer;
}

function loadOSMLayer(layerManager: LayerManager, id: string) {
    const layer = new ColorLayer(id, {
        extent: layerManager.extent,
        source: new TiledImageSource({ source: new OSM() }),
    });

    layer.visible = false;

    layerManager.addBaseLayer(layer);

    return layer;
}

function loadImageryLayer(layerManager: LayerManager, id: string) {
    // Create a WMS imagery layer
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
        extent: layerManager.extent,
        source: wmsOthophotoSource,
    },
    );

    layerManager.addBaseLayer(colorLayer);

    return colorLayer;
}

function onGiro3DMounted(mainController: MainController) {
    controller = new BasemapController(mainController.layerManager);
}

export default {
    getBasemaps,
}

export class BasemapController {
    private readonly layerManager: LayerManager;
    private readonly layers: Map<string, Layer>;

    onOpacityChanged(basemap: Basemap) {
        const id = basemap.id;
        const layer = this.layers.get(id);
        if (layer.type === 'ColorLayer') {
            (layer as ColorLayer).opacity = basemap.opacity;
            this.layerManager.notify(layer);
        }
    }

    onVisibilityChanged(basemap: Basemap) {
        const id = basemap.id;
        const layer = this.layers.get(id);
        layer.visible = basemap.visible;
        this.layerManager.notify(layer);
    }

    constructor(layerManager: LayerManager) {
        this.layerManager = layerManager;
        this.layers = new Map();

        this.layers.set('elevation', loadElevationLayer(this.layerManager, 'elevation'));
        this.layers.set('imagery', loadImageryLayer(this.layerManager, 'imagery'));
        this.layers.set('osm', loadOSMLayer(this.layerManager, 'osm'));

        for (const bm of basemaps) {
            bm.addEventListener('opacity', () => this.onOpacityChanged(bm));
            bm.addEventListener('visible', () => this.onVisibilityChanged(bm));
        }
    }
}