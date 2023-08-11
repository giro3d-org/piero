import Instance from '@giro3d/giro3d/core/Instance.js'
import Extent from '@giro3d/giro3d/core/geographic/Extent.js'
import Camera from './CameraController';

const DEFAULT_CRS = 'EPSG:2154';

/** @type {Instance} */
let mainInstance;
let mainCamera;

let initialized = false;

function getMainInstance() {
    return mainInstance
}

function initializeOnce() {
    if (initialized) {
        return;
    }

    Instance.registerCRS('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs');
    Instance.registerCRS('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs');
    Instance.registerCRS('EPSG:2154', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
    Instance.registerCRS('EPSG:4171', '+proj=longlat +ellps=GRS80 +no_defs +type=crs');
    Instance.registerCRS('EPSG:3946', '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

    initialized = true;
}

function mountGiro3D(div, inspectorDiv) {
    initializeOnce();

    mainInstance = new Instance(div, {
        crs: DEFAULT_CRS,
        renderer: {
            clearColor: 0xcccccc,
        },
    })

    mainCamera = new Camera(mainInstance);
    mainCamera.bindKeys();

    mainInstance.notifyChange()

    // TODO
    // Inspector.attach(inspectorDiv, mainInstance);

    return mainInstance
}

function unmountGiro3D() {
    mainInstance?.dispose();
}

function getProgress() {
    return mainInstance?.progress ?? 0;
}

export default {
    mountGiro3D,
    getMainInstance,
    unmountGiro3D,
    getProgress,
}