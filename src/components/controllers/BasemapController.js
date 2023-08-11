import { Vector2 } from 'three'
import GiroMap from '@giro3d/giro3d/entities/Map.js'
import Instance from '@giro3d/giro3d/core/Instance.js'
import Extent from '@giro3d/giro3d/core/geographic/Extent.js'
import Basemap from "../../types/Basemap"

const DEFAULT_EXTENT = new Extent('EPSG:2154', -378305.81, 6005281.2, 1320649.57, 7235612.72);

const basemaps = [
    new Basemap('OSM'),
    new Basemap('Imagery'),
    new Basemap('Elevation'),
];

function getBasemaps() {
    return basemaps;
}

/**
 * @param {Instance} instance
 */
function loadBasemaps(instance) {
    const giroMap = new GiroMap('basemaps', {
        extent: DEFAULT_EXTENT,
    })

    instance.add(giroMap);

    const center = giroMap.extent.center(new Vector2());
    instance.camera.camera3D.position.set(center.x, center.y, 5000000);
    instance.camera.camera3D.lookAt(center.x, center.y, 0);
}

export default {
    getBasemaps,
    loadBasemaps,
}