import * as THREE from "three";

import Instance from "@giro3d/giro3d/core/Instance";
import Extent from "@giro3d/giro3d/core/geographic/Extent";
import Coordinates from "@giro3d/giro3d/core/geographic/Coordinates";
import Inspector from "@giro3d/giro3d/gui/Inspector"
import { MAIN_LOOP_EVENTS } from "@giro3d/giro3d/core/MainLoop";

import LayerManager from "./LayerManager";
import Camera from "./CameraController";

const DEFAULT_CRS = 'EPSG:2154';

Instance.registerCRS('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs');
Instance.registerCRS('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs');
Instance.registerCRS('EPSG:2154', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
Instance.registerCRS('EPSG:4171', '+proj=longlat +ellps=GRS80 +no_defs +type=crs');
Instance.registerCRS('EPSG:3946', '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

let singleton: MainController;

const initCallbacks : Function[] = [];

export default class MainController extends THREE.EventDispatcher {
    readonly camera: Camera;
    readonly mainInstance: Instance;
    readonly layerManager: LayerManager;

    constructor(domElement: HTMLDivElement, inspectorElement: HTMLDivElement) {
        super();

        const crs = DEFAULT_CRS;

        this.mainInstance = new Instance(domElement, {
            crs,
            renderer: {
                clearColor: 0xcccccc,
            },
        })

        const center = new Coordinates('EPSG:4326', 4.84, 45.76, 0).as(crs) as Coordinates;
        const xyz = new THREE.Vector3(center.x(), center.y(), center.z());

        this.camera = new Camera(this.mainInstance, xyz);
        this.camera.bindKeys();

        this.mainInstance.notifyChange();

        const extent = Extent.fromCenterAndSize(crs, { x: xyz.x, y: xyz.y }, 10000, 10000);
        this.camera.setInitialPosition(extent);

        this.layerManager = new LayerManager(this.mainInstance);

        this.mainInstance.addFrameRequester(MAIN_LOOP_EVENTS.UPDATE_END, () => this.dispatchEvent({ type: 'update' }));

        Inspector.attach(inspectorElement, this.mainInstance, { title: 'Main view', width: 300 });

        this.mainInstance.notifyChange();
    }

    dispose() {
        this.mainInstance.dispose();
    }

    static onInit(callback: (arg0: MainController) => void) {
        if (singleton) {
            callback(singleton);
        }

        initCallbacks.push(callback);
    }

    static init(domElement: HTMLDivElement, inspectorElement: HTMLDivElement) {
        singleton = new MainController(domElement, inspectorElement);
        initCallbacks.forEach(cb => cb(singleton));
        return singleton;
    }

    static get() {
        return singleton;
    }
}
