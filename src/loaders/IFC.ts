import { Vector3 } from 'three';
import {
    Components,
    SimpleScene,
    SimpleRenderer,
    SimpleCamera,
    SimpleRaycaster,
    FragmentManager,
    FragmentIfcLoader,
    FragmentClassifier,
} from 'openbim-components';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Instance from '@giro3d/giro3d/core/Instance';
import IfcEntity from '@/giro3d/IfcEntity';

import Fetcher from '@/utils/Fetcher';
import loader from './loader';

/** Parameters for creating IFC object */
export type IFCParameters = {
    name: string;
    at?: Coordinates;
};

export default {
    async load(
        instance: Instance,
        url: string | ArrayBuffer | Blob | Response,
        parameters: IFCParameters,
    ): Promise<IfcEntity> {
        const data = await Fetcher.arrayBuffer(url);
        const entity = await this.loadArrayBuffer(instance, data, parameters);
        loader.fillOrigin(entity.object3d, url);
        return entity;
    },

    async loadArrayBuffer(
        instance: Instance,
        data: ArrayBuffer,
        parameters: IFCParameters,
    ): Promise<IfcEntity> {
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

        fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
        fragmentIfcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;

        const buffer = new Uint8Array(data);
        const ifcModel = await fragmentIfcLoader.load(buffer, parameters.name);

        // IFC models are Y-up, so we need to rotate them to be Z-up.
        ifcModel.rotateX(Math.PI / 2);

        const position = new Vector3();
        // If custom coordinates are provided, we ignore the IFC's placement
        if (parameters.at) {
            parameters.at.as(instance.referenceCrs).toVector3(position);
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
            position.applyMatrix4(coordinationMatrix);
            ifcModel.position.set(position.x, -position.z, position.y);
        }

        ifcModel.updateWorldMatrix(true, true);

        const entity = new IfcEntity(ifcModel, components, fragmentManager, classifier);
        await entity.initClassification();
        return entity;
    },
};
