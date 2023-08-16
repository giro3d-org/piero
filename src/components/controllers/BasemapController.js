import { Vector2 } from 'three'

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

const basemaps = [
    new Basemap('OSM'),
    new Basemap('Imagery'),
    new Basemap('Elevation'),
];

function getBasemaps() {
    return basemaps;
}

function loadElevationLayer(map) {
    const source = new TileWMS({
        url: 'https://wxs.ign.fr/altimetrie/geoportail/r/wms',
        projection: map.extent.crs(),
        crossOrigin: 'anonymous',
        params: {
            LAYERS: ['ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES'],
            FORMAT: 'image/x-bil;bits=32',
            VERSION: '1.3.0',
        },
    });
    const noDataValue = -1000;
    const format = new BilFormat();

    map.addLayer(new ElevationLayer('elevation', {
        source: new TiledImageSource({ source, format, noDataValue }),
        extent: map.extent,
        noDataValue,
    }));
}

/**
 * @param {GiroMap} map
 */
function loadOSMLayer(map) {
    const layer = new ColorLayer('osm', {
        extent: map.extent,
        source: new TiledImageSource({ source: new OSM() }),
    });

    layer.visible = true;

    map.addLayer(layer);
}

function loadImageryLayer(map) {
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

    const colorLayer = new ColorLayer('imagery', {
        extent: map.extent,
        source: wmsOthophotoSource,
    },
    );
    map.addLayer(colorLayer);
}

/**
 * @param {Instance} instance
 */
function loadBasemaps(instance) {
    const center = new Coordinates('EPSG:4326', 4.84, 45.76).as(instance.referenceCrs).xyz();
    const extent = Extent.fromCenterAndSize(instance.referenceCrs, { x: center.x, y: center.y }, 30000, 30000);

    const giroMap = new GiroMap('basemaps', {
        extent,
        hillshading: true,
        segments: 128,
    })

    instance.add(giroMap);

    loadOSMLayer(giroMap);
    loadElevationLayer(giroMap);
    loadImageryLayer(giroMap);

    instance.notifyChange();
}

export default {
    getBasemaps,
    loadBasemaps,
}