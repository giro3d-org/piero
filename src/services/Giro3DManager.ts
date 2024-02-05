import {
    EventDispatcher,
    Box3,
    AmbientLight,
    DirectionalLight,
    PerspectiveCamera,
    Object3D,
} from 'three';

import Instance from '@giro3d/giro3d/core/Instance';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import { HttpConfiguration } from '@giro3d/giro3d/utils';

import LayerManager from '@/services/LayerManager';
import BasemapManager from '@/services/BasemapManager';
import OverlayManager from '@/services/OverlayManager';
import CameraController from '@/services/CameraController';
import DatasetManager from '@/services/DatasetManager';
import AnnotationManager from '@/services/AnnotationManager';
import AnalysisManager from '@/services/AnalysisManager';
import Highlighter from '@/services/Highlighter';
import Picker from '@/services/Picker';
import MeasurementManager from '@/services/MeasurementManager';
import { useGiro3dStore } from '@/stores/giro3d';

Instance.registerCRS(
    'EPSG:2154',
    '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
);
Instance.registerCRS(
    'EPSG:3857',
    '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
);
Instance.registerCRS(
    'EPSG:3946',
    '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
);
Instance.registerCRS(
    'EPSG:3948',
    '+proj=lcc +lat_0=48 +lon_0=3 +lat_1=47.25 +lat_2=48.75 +x_0=1700000 +y_0=7200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
);
Instance.registerCRS('EPSG:4171', '+proj=longlat +ellps=GRS80 +no_defs +type=crs');
Instance.registerCRS('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs');
Instance.registerCRS(
    'IGNF:WGS84G',
    '+title=World Geodetic System 1984 +proj=longlat +nadgrids=null +wktext +towgs84=0.0000,0.0000,0.0000 +a=6378137.0000 +rf=298.2572221010000 +units=m +no_defs',
);

if (import.meta.env.VITE_AUTHORIZATION_DOMAIN && import.meta.env.VITE_AUTHORIZATION_VALUE) {
    HttpConfiguration.setAuth(
        import.meta.env.VITE_AUTHORIZATION_DOMAIN,
        import.meta.env.VITE_AUTHORIZATION_VALUE,
    );
}

type Giro3DManagerEventMap = {
    update: {};
};

export default class Giro3DManager extends EventDispatcher<Giro3DManagerEventMap> {
    private readonly store = useGiro3dStore();

    readonly mainInstance: Instance;
    readonly camera: CameraController;
    readonly layerManager: LayerManager;
    readonly basemapManager: BasemapManager;
    readonly overlayManager: OverlayManager;
    readonly datasetManager: DatasetManager;
    readonly annotationManager: AnnotationManager;
    readonly analysisManager: AnalysisManager;
    readonly highlighter: Highlighter;
    readonly picker: Picker;
    readonly measurementManager: MeasurementManager;

    constructor(instance: Instance) {
        super();

        const crs = instance.referenceCrs;

        this.mainInstance = instance;

        this.picker = new Picker();
        this.camera = new CameraController(this.mainInstance, this.picker);

        const center = this.store.getDefaultCameraPosition().as(crs);
        const xyz = center.toVector3();
        const basemapSize = this.store.getDefaultBasemapSize();
        const extent = Extent.fromCenterAndSize(
            crs,
            { x: xyz.x, y: xyz.y },
            basemapSize.width,
            basemapSize.height,
        );
        this.camera.setInitialPosition(extent);

        this.layerManager = new LayerManager(this.mainInstance);
        this.basemapManager = new BasemapManager(this.layerManager);
        this.overlayManager = new OverlayManager(this.layerManager, this.mainInstance);
        this.datasetManager = new DatasetManager(this.mainInstance, this.camera);
        this.annotationManager = new AnnotationManager(this.mainInstance, this.camera, this.picker);
        this.analysisManager = new AnalysisManager(this.mainInstance, this.layerManager);
        this.highlighter = new Highlighter(this.mainInstance);
        this.picker = new Picker();
        this.measurementManager = new MeasurementManager(
            this.mainInstance,
            this.camera,
            this.picker,
        );

        this.mainInstance.addEventListener('update-end', () => this.onFrameEnd());

        this.mainInstance.renderingOptions.enableEDL = true;
        this.mainInstance.renderingOptions.enableInpainting = true;
        this.mainInstance.renderingOptions.enablePointCloudOcclusion = true;

        const lightColor = 0xffffff;

        const ambientLight = new AmbientLight(lightColor, 0.6);
        this.mainInstance.scene.add(ambientLight);

        const dirLight = new DirectionalLight(lightColor, 2);
        dirLight.position.set(center.x - 10000, center.y - 10000, 10000);
        dirLight.target.position.set(center.x, center.y, 0);
        this.mainInstance.scene.add(dirLight);
        this.mainInstance.scene.add(dirLight.target);
        dirLight.updateMatrixWorld();
        this.mainInstance.scene.updateMatrixWorld();

        // We disable the skybox for now as it breaks the rendering of point cloud  with effects.
        // Skybox.addSkybox(this.mainInstance);

        this.mainInstance.notifyChange();
    }

    onFrameEnd() {
        // Temporary solution to avoid annoying horizontal line artifacts
        // on point cloud due to constantly shifting near clipping plane.
        const camera: PerspectiveCamera = this.mainInstance.camera.camera3D;
        camera.near = 2;

        this.dispatchEvent({ type: 'update' });
    }

    /**
     * Gets the datasets & annotations as Object3D.
     */
    getObjects3d(): Object3D[] {
        const result: Object3D[] = [];
        this.mainInstance.scene.traverse(o => {
            result.push(o);
        });
        return result;
    }

    /**
     * Gets bounding box of all datasets & annotations.
     *
     * @returns Bounding box of all datasets.
     */
    getBoundingBox() {
        const bbox = new Box3();
        const bbox2 = new Box3();
        this.mainInstance.scene.traverse(obj => {
            bbox2.setFromObject(obj);
            bbox.union(bbox2);
        });
        return bbox;
    }

    dispose() {
        this.mainInstance.dispose();
    }
}
