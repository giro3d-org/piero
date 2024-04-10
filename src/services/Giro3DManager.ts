import { EventDispatcher, Box3, AmbientLight, DirectionalLight, Object3D } from 'three';

import Instance from '@giro3d/giro3d/core/Instance';
import { HttpConfiguration } from '@giro3d/giro3d/utils';

import LayerManager from '@/services/LayerManager';
import CameraController from '@/services/CameraController';
import DatasetManager from '@/services/DatasetManager';
import AnnotationManager from '@/services/AnnotationManager';
import AnalysisManager from '@/services/AnalysisManager';
import Highlighter from '@/services/Highlighter';
import Picker from '@/services/Picker';
import MeasurementManager from '@/services/MeasurementManager';
import { useGiro3dStore } from '@/stores/giro3d';
import { getPublicFolderUrl } from '@/utils/Configuration';
import Fetcher from '@/utils/Fetcher';

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
    'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]',
);

if (import.meta.env.VITE_HEADERS) {
    for (const [host, header] of Object.entries(import.meta.env.VITE_HEADERS)) {
        if (!Fetcher.checkAbsoluteHost(host)) {
            console.warn(`Invalid host in VITE_HEADERS: ${host}`);
            continue;
        }

        for (const [name, value] of Object.entries(header)) {
            HttpConfiguration.setHeader(host, name, value);
        }
    }
}

if (import.meta.env.VITE_AUTHORIZATION_DOMAIN && import.meta.env.VITE_AUTHORIZATION_VALUE) {
    if (!Fetcher.checkAbsoluteHost(import.meta.env.VITE_AUTHORIZATION_DOMAIN)) {
        console.warn(
            `Invalid host in VITE_AUTHORIZATION_DOMAIN: ${import.meta.env.VITE_AUTHORIZATION_DOMAIN}`,
        );
    } else {
        HttpConfiguration.setAuth(
            import.meta.env.VITE_AUTHORIZATION_DOMAIN,
            import.meta.env.VITE_AUTHORIZATION_VALUE,
        );
    }
}

if (import.meta.env.VITE_AUTHORIZATIONS) {
    for (const [host, value] of Object.entries(import.meta.env.VITE_AUTHORIZATIONS)) {
        if (!Fetcher.checkAbsoluteHost(host)) {
            console.warn(`Invalid host in VITE_AUTHORIZATIONS: ${host}`);
            continue;
        }
        HttpConfiguration.setAuth(host, value);
    }
}

type Giro3DManagerEventMap = {
    update: {
        /** empty */
    };
};

export default class Giro3DManager extends EventDispatcher<Giro3DManagerEventMap> {
    private readonly _store = useGiro3dStore();

    readonly mainInstance: Instance;
    readonly camera: CameraController;
    readonly layerManager: LayerManager;
    readonly datasetManager: DatasetManager;
    readonly annotationManager: AnnotationManager;
    readonly analysisManager: AnalysisManager;
    readonly highlighter: Highlighter;
    readonly picker: Picker;
    readonly measurementManager: MeasurementManager;
    readonly ambientLight: AmbientLight;
    readonly dirLight: DirectionalLight;

    private readonly _boundOnFrameEnd: () => void;

    constructor(instance: Instance) {
        super();

        this.mainInstance = instance;

        this.picker = new Picker();
        this.camera = new CameraController(this.mainInstance, this.picker);

        const position = this._store.getDefaultCameraPosition();
        const lookAt = this._store.getDefaultCameraLookAt();
        this.camera.lookAt(position.toVector3(), lookAt.toVector3());

        this.layerManager = new LayerManager(this.mainInstance);
        this.datasetManager = new DatasetManager(this.mainInstance);
        this.annotationManager = new AnnotationManager(this.mainInstance, this.camera, this.picker);
        this.analysisManager = new AnalysisManager(this.mainInstance, this.layerManager);
        this.highlighter = new Highlighter();
        this.picker = new Picker();
        this.measurementManager = new MeasurementManager(
            this.mainInstance,
            this.camera,
            this.picker,
        );

        this._boundOnFrameEnd = this.onFrameEnd.bind(this);
        this.mainInstance.addEventListener('update-end', this._boundOnFrameEnd);

        this.mainInstance.renderingOptions.enableEDL = true;
        this.mainInstance.renderingOptions.enableInpainting = true;
        this.mainInstance.renderingOptions.enablePointCloudOcclusion = true;

        const lightColor = 0xffffff;

        this.ambientLight = new AmbientLight(lightColor, 0.6);
        this.mainInstance.scene.add(this.ambientLight);

        this.dirLight = new DirectionalLight(lightColor, 2);
        this.dirLight.position.set(lookAt.x - 10000, lookAt.y - 10000, 10000);
        this.dirLight.target.position.set(lookAt.x, lookAt.y, 0);
        this.mainInstance.scene.add(this.dirLight);
        this.mainInstance.scene.add(this.dirLight.target);
        this.dirLight.updateMatrixWorld();
        this.mainInstance.scene.updateMatrixWorld();

        // We disable the skybox for now as it breaks the rendering of point cloud  with effects.
        // Skybox.addSkybox(this.mainInstance);

        this.mainInstance.notifyChange();

        // Preload web-ifc.wasm
        Fetcher.blob(getPublicFolderUrl('web-ifc.wasm')).catch(e => {
            console.warn('Could not load web-ifc.wasm', e);
        });
    }

    dispose() {
        this.mainInstance.removeEventListener('update-end', this._boundOnFrameEnd);
        this.mainInstance.scene.remove(this.dirLight.target);
        this.mainInstance.scene.remove(this.dirLight);
        this.mainInstance.scene.remove(this.ambientLight);
        this.measurementManager.dispose();
        this.highlighter.dispose();
        this.analysisManager.dispose();
        this.annotationManager.dispose();
        this.layerManager.dispose();
        this.camera.dispose();
    }

    onFrameEnd() {
        // Temporary solution to avoid annoying horizontal line artifacts
        // on point cloud due to constantly shifting near clipping plane.
        const camera = this.mainInstance.camera.camera3D;
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
}
