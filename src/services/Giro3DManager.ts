import AnalysisManager from '@/services/AnalysisManager';
import AnnotationManager from '@/services/AnnotationManager';
import CameraController from '@/services/CameraController';
import DatasetManager from '@/services/DatasetManager';
import Highlighter from '@/services/Highlighter';
import LayerManager from '@/services/LayerManager';
import MeasurementManager from '@/services/MeasurementManager';
import Picker from '@/services/Picker';
import { useGiro3dStore } from '@/stores/giro3d';
import Download from '@/utils/Download';
import Fetcher from '@/utils/Fetcher';
import type Instance from '@giro3d/giro3d/core/Instance';
import { setLazPerfPath } from '@giro3d/giro3d/sources/las/config';
import HttpConfiguration from '@giro3d/giro3d/utils/HttpConfiguration';
import type { Object3D } from 'three';
import { AmbientLight, Box3, DirectionalLight, EventDispatcher } from 'three';

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

if (
    import.meta.env.VITE_AUTHORIZATION_DOMAIN != null &&
    import.meta.env.VITE_AUTHORIZATION_VALUE != null
) {
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
        this.datasetManager = new DatasetManager(this.mainInstance, this.layerManager);
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

        const publicPath = Download.getBaseUrl().slice(0, -1);
        setLazPerfPath(publicPath);

        // Preload web-ifc.wasm
        Fetcher.fetch('web-ifc.wasm').catch(e => {
            console.warn('Could not load web-ifc.wasm', e);
        });
        Fetcher.fetch('laz-perf.wasm').catch(e => {
            console.warn('Could not load laz-perf.wasm', e);
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
        const camera = this.mainInstance.view.camera;
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
