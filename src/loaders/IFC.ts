import { Vector3 } from 'three';
import { Components, SimpleScene, SimpleRenderer, SimpleCamera, SimpleRaycaster, FragmentManager, FragmentIfcLoader, FragmentClassifier } from 'openbim-components';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Instance from '@giro3d/giro3d/core/Instance';
import IfcEntity from '@/giro3d/IfcEntity';

/**
 * IFC options
 */
interface IFCOptions {
    at?: Coordinates;
}

export default {
    /**
     * Loads an IFC file.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param file IFC file
     * @param options Options
     * @returns Entity created
     */
    async loadIfc(instance: Instance, id: string, file: File | Response, options: IFCOptions = {}) {
        const data = await file.arrayBuffer();

        const components = new Components();
        components.ui.enabled = false;

        components.scene = new SimpleScene(components);
        components.renderer = new SimpleRenderer(components, document.createElement('div'));
        components.camera = new SimpleCamera(components);
        components.raycaster = new SimpleRaycaster(components);

        components.init();

        const fragmentManager = await components.tools.get(FragmentManager);

        const classifier = await components.tools.get(FragmentClassifier);
        const fragmentIfcLoader = new FragmentIfcLoader(components);

        // TODO replace with own WASM ?
        fragmentIfcLoader.settings.wasm = {
            path: "https://unpkg.com/web-ifc@0.0.44/",
            absolute: true
        }

        fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
        fragmentIfcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;

        const buffer = new Uint8Array(data);
        const ifcModel = await fragmentIfcLoader.load(buffer, id);

        // IFC models are Y-up, so we need to rotate them to be Z-up.
        ifcModel.rotateX(Math.PI / 2);

        let position: Vector3 = new Vector3();
        // If custom coordinates are provided, we ignore the IFC's placement
        if (options.at) {
            position = options.at.as(instance.referenceCrs).xyz(position);
            ifcModel.position.copy(position);
        } else {
            // Since we are loading the model with COORDINATE_TO_ORIGIN = true, all vertices will be
            // expressed as an offset from the root object, rather than their absolute world space
            // positions. We then have to compute a transformation matrix to put the object back in
            // its original position.
            // For this, we use the undocumented coordination matrix which is the transformation
            // from world to local space.
            //
            // However, since Giro3D is Z-up, we need to swap Y and Z, and then invert the sign of
            // the new Y (i.e the Z before the swap).
            //
            // Important note: the IFC's origin is not transformed to the instance's CRS. We assume that
            // The IFC file is in the same coordinate system as the instance.
            const coordinationMatrix = ifcModel.coordinationMatrix.clone().invert();
            const pos = new Vector3().applyMatrix4(coordinationMatrix);
            ifcModel.position.set(pos.x, -pos.z, pos.y);
        }

        ifcModel.updateWorldMatrix(true, true);

        const entity = new IfcEntity(ifcModel, components, fragmentManager, classifier);
        await entity.initClassification();
        return entity;
    },
};
