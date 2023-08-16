import * as THREE from 'three'
import OSM from 'ol/source/OSM'
import GiroMap from '@giro3d/giro3d/entities/Map.js'
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource.js'
import Extent from '@giro3d/giro3d/core/geographic/Extent.js'
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer'
import Giro3DController from './Giro3DController'
import Instance from '@giro3d/giro3d/core/Instance'
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates'
import Viewbox from '../../types/Viewbox'

const DEFAULT_EXTENT = new Extent(
    'EPSG:3857',
    -20037508.342789244, 20037508.342789244,
    -20037508.342789244, 20037508.342789244,
);

/** @type {Instance} */
let minimapInstance;
/** @type {Viewbox} */
let viewbox;
let giroMap;

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

function getCorners(instance) {
    const canvasSize = instance.mainLoop.gfxEngine.getWindowSize();
    const camera = instance.camera.camera3D;

    /**
     * @param {number} x
     * @param {number} y
     */
    function raycast(x, y) {
        const results = instance.pickObjectsAt({ x, y }, { limit: 1, radius: 0 });
        const point = results.at(0)?.point;
        if (point) {
            // point.unproject(camera)

            const result = new Coordinates(instance.referenceCrs, point.x, point.y, 1)
                .as(minimapInstance.referenceCrs)
                .xyz();

            result.z = 1;

            return result;
        }
        return undefined;
    }

    const ul = raycast(0, 0);
    const ur = raycast(canvasSize.x - 1, 0);
    const ll = raycast(0, canvasSize.y - 1);
    const lr = raycast(canvasSize.x - 1, canvasSize.y - 1);

    if (!ul || !ur || !ll || !lr) {
        return undefined;
    }

    return { ul, ur, ll, lr }
}

function updateViewbox(mainInstance) {
    if (!mainInstance) {
        return;
    }

    let corners = getCorners(mainInstance);
    const mainCamera = mainInstance.camera.camera3D;
    const minimapCamera = minimapInstance.camera.camera3D;

    if (corners) {
        viewbox.object3D.visible = true;
        const { ul, ur, ll, lr } = corners;
        viewbox.setCorners(ul, ur, lr, ll);
        const box = new THREE.Box3();
        box.setFromPoints([ul, ur, ll, lr]);
        const xyz = box.getCenter(new THREE.Vector3());
        const altitude = mainCamera.position.z + 2000;
        minimapCamera.position.set(xyz.x, xyz.y, THREE.MathUtils.clamp(altitude, 1000, 50000));
        minimapCamera.lookAt(xyz.x, xyz.y + 1, 0);

    } else {
        viewbox.object3D.visible = false;

        const xyz = mainCamera.position;
        minimapCamera.position.set(xyz.x, xyz.y, minimapCamera.position.z);
        minimapCamera.lookAt(xyz.x, xyz.y + 1, 0);
    }

    minimapInstance.notifyChange(giroMap);
}

/**
 * @param {HTMLDivElement} div
 */
function loadMinimap(div) {
    Giro3DController.initializeOnce();

    Giro3DController.registerCallback(() => {
        updateViewbox(Giro3DController.getMainInstance());
    });

    minimapInstance = new Instance(div, {
        crs: 'EPSG:3857',
        renderer: {
            clearColor: 0xcccccc,
        },
    })

    viewbox = new Viewbox();

    minimapInstance.scene.add(viewbox.object3D);

    viewbox.object3D.updateMatrixWorld();

    minimapInstance.notifyChange()

    giroMap = new GiroMap('minimap', {
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