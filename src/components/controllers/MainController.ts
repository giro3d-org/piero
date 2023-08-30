import * as THREE from "three";

import Instance from "@giro3d/giro3d/core/Instance";
import Extent from "@giro3d/giro3d/core/geographic/Extent";
import Coordinates from "@giro3d/giro3d/core/geographic/Coordinates";
import { MAIN_LOOP_EVENTS } from "@giro3d/giro3d/core/MainLoop";

import LayerManager from "./LayerManager";
import Camera from "./CameraController";
import Drawing from "@giro3d/giro3d/interactions/Drawing";
import Skybox from "../../giro3d/Skybox";

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

    constructor(domElement: HTMLDivElement) {
        super();

        const crs = DEFAULT_CRS;

        this.mainInstance = new Instance(domElement, {
            crs,
            renderer: {
                clearColor: 0xcccccc,
            },
        })

        this.camera = new Camera(this.mainInstance);
        this.camera.bindKeys();

        const center = new Coordinates('EPSG:4326', 4.84, 45.76, 0).as(crs) as Coordinates;
        const xyz = new THREE.Vector3(center.x(), center.y(), center.z());
        const extent = Extent.fromCenterAndSize(crs, { x: xyz.x, y: xyz.y }, 10000, 10000);
        this.camera.setInitialPosition(extent);

        this.layerManager = new LayerManager(this.mainInstance);

        this.mainInstance.addFrameRequester(MAIN_LOOP_EVENTS.UPDATE_END, () => this.onFrameEnd());

        this.mainInstance.renderingOptions.enableEDL = true;
        this.mainInstance.renderingOptions.enableInpainting = true;
        this.mainInstance.renderingOptions.enablePointCloudOcclusion = true;

        const lightColor = 0xffffff;

        const ambientLight = new THREE.AmbientLight(lightColor, 0.5);
        this.mainInstance.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(lightColor, 0.5);
        dirLight.position.set(1, -1.75, 1);
        this.mainInstance.scene.add(dirLight);
        dirLight.updateMatrixWorld();

        // We disable the skybox for now as it breaks the rendering of point cloud  with effects.
        // Skybox.addSkybox(this.mainInstance);

        this.mainInstance.notifyChange();
    }

    onFrameEnd() {
        // Temporary solution to avoid annoying horizontal line artifacts
        // on point cloud due to constantly shifting near clipping plane.
        const camera : THREE.PerspectiveCamera = this.mainInstance.camera.camera3D;
        camera.near = 2;

        this.dispatchEvent({ type: 'update' })
    }

    /**
     * Gets the datasets & annotations as Object3D.
     */
    getObjects3d(): THREE.Object3D[] {
        const result = [];
        this.mainInstance.scene.traverse(o => {
            result.push(o);
        })
        return result;
    }

    /**
     * Gets bounding box of all datasets & annotations.
     *
     * @returns Bounding box of all datasets.
     */
    getBoundingBox() {
        const bbox = new THREE.Box3();
        const bbox2 = new THREE.Box3();
        this.mainInstance.scene.traverse(obj => {
            bbox2.setFromObject(obj);
            bbox.union(bbox2);
        });
        return bbox;
    }

    /**
     * Gets the closest dataset object from where the user clicked.
     * Does **NOT** pick on the base map!
     *
     * @param {MouseEvent} e Mouse event
     * @param {number} radius Radius - the smaller, the faster and more precise (but
     * may return nothing)
     * @returns {PickResult|null} Result or null if notthing found
     */
    getObjectAt(e, radius = 1) {
        const picked = this.mainInstance.pickObjectsAt(e, {
            radius,
            where: this.getObjects3d(),
        }).filter(p => p.layer === null || p.layer.type !== 'Map')
            .sort((a, b) => (a.distance - b.distance))
            .at(0);

        let layer = null;
        let rootobj = null;
        let drawing = null;

        if (picked) {
            rootobj = picked.object;
            while (layer === null && rootobj !== null) {
                if (rootobj instanceof Drawing) drawing = rootobj;

                // TODO
                // if (this.has(rootobj.uuid)) {
                //     layer = this.get(rootobj.uuid);
                // } else {
                //     rootobj = rootobj.parent;
                // }
            }

            return {
                ...picked,
                layer,
                rootobj,
                drawing,
            };
        }
        return null;
    }

    getVectorFeatureAt(e, radius = 1) {
        const pickedOnMap = this.mainInstance.pickObjectsAt(e, { limit: 1, radius }).at(0);
        if (pickedOnMap && pickedOnMap.layer?.type === 'Map') {
            const coord = pickedOnMap.coord;
            const parentMap = pickedOnMap.layer;
            const tile = pickedOnMap.object;

            const feature = parentMap.getVectorFeaturesAtCoordinate(coord, 10, tile).at(0);
            if (feature) {
                return {
                    layer: feature.layer,
                    feature: feature.feature,
                    rootobj: parentMap.object3d,
                };
            }
        }
        return null;
    }

    getFirstFeatureAt(e, radius = 1) {
        const picked = this.getObjectAt(e, radius);
        if (picked) {
            return picked;
        }

        const pickedOnMap = this.getVectorFeatureAt(e, radius);
        if (pickedOnMap) {
            return pickedOnMap;
        }

        return null;
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

    static init(domElement: HTMLDivElement) {
        singleton = new MainController(domElement);
        initCallbacks.forEach(cb => cb(singleton));
        return singleton;
    }

    static get() {
        return singleton;
    }
}
