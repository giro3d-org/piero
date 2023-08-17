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

    const layer = new ElevationLayer(id, {
        source: new TiledImageSource({ source, format, noDataValue }),
        extent: layerManager.extent,
        noDataValue,
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

/**
 * @param {Instance} instance
 */
function loadBasemaps(instance) {
    currentInstance = instance;

    const center = new Coordinates('EPSG:4326', 4.84, 45.76).as(instance.referenceCrs).xyz();
    const extent = Extent.fromCenterAndSize(instance.referenceCrs, { x: center.x, y: center.y }, 30000, 30000);

    giroMap = new GiroMap('basemaps', {
        extent,
        hillshading: {
            enabled: true,
            elevationLayersOnly: true,
        },
        segments: 128,
        backgroundColor: 'white',
    })

    instance.add(giroMap);

    layers.set('elevation', loadElevationLayer(giroMap, 'elevation'));
    layers.set('imagery', loadImageryLayer(giroMap, 'imagery'));
    layers.set('osm', loadOSMLayer(giroMap, 'osm'));

    instance.notifyChange();
}

/**
 * @param {Basemap} basemap
 * @param {number} opacity
 */
function setOpacity(basemap, opacity) {
    basemap.opacity = opacity;
    const layer = layers.get(basemap.id);
    layer.opacity = opacity;
    currentInstance.notifyChange(layer);
}

/**
 * @param {Basemap} basemap
 * @param {boolean} visible
 */
function setVisibility(basemap, visible) {
    basemap.visible = visible;
    const layer = layers.get(basemap.id);
    layer.visible = visible;
    currentInstance.notifyChange(layer);
}

function getExtent() {
    return giroMap.extent;
}

function onGiro3DMounted(mainController: MainController) {
    controller = new BasemapController(mainController.layerManager);
}

export default {
    getBasemaps,
    loadBasemaps,
    setOpacity,
    setVisibility,
    getExtent,
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