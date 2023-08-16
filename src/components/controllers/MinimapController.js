import { Vector2 } from 'three'
import OSM from 'ol/source/OSM'
import GiroMap from '@giro3d/giro3d/entities/Map.js'
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource.js'
import Extent from '@giro3d/giro3d/core/geographic/Extent.js'
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer'
import Giro3DController from './Giro3DController'
import Instance from '@giro3d/giro3d/core/Instance'
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates'

const DEFAULT_EXTENT = new Extent(
    'EPSG:3857',
    -20037508.342789244, 20037508.342789244,
    -20037508.342789244, 20037508.342789244,
);

let minimapInstance;

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

/**
 * @param {HTMLDivElement} div
 */
function loadMinimap(div) {
    Giro3DController.initializeOnce();

    minimapInstance = new Instance(div, {
        crs: 'EPSG:3857',
        renderer: {
            clearColor: 0xcccccc,
        },
    })

    minimapInstance.notifyChange()

    const giroMap = new GiroMap('minimap', {
        extent: DEFAULT_EXTENT,
    })

    minimapInstance.add(giroMap);

    loadOSMLayer(giroMap);

    const center = new Coordinates('EPSG:4326', 4.84, 45.76).as(minimapInstance.referenceCrs);

    const xyz = center.xyz();
    minimapInstance.camera.camera3D.position.set(xyz.x, xyz.y, 20000);
    minimapInstance.camera.camera3D.lookAt(xyz.x, xyz.y + 1, 0);

    minimapInstance.notifyChange()
}

export default {
    loadMinimap
}