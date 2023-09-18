import { IFCLoader } from 'three/examples/jsm/loaders/IFCLoader.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Instance from '@giro3d/giro3d/core/Instance';

const ifcLoader = new IFCLoader();
// @ts-ignore - Don't need to set other settings
ifcLoader.ifcManager.applyWebIfcConfig({
    COORDINATE_TO_ORIGIN: true,
});
// By default ifcManager searches wasm in node_modules/.... and doesn't like '/'...
if (import.meta.env.PROD) {
    ifcLoader.ifcManager.setWasmPath(import.meta.env.BASE_URL + '/');
} else {
    ifcLoader.ifcManager.setWasmPath('/');
}

/**
 * IFC options
 */
interface IFCOptions {
    at?: Coordinates;
}

export default {
    /**
     * Loads a CityJSON file as a string.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param file IFC file
     * @param options Options
     * @returns Entity created
     */
    async loadIfc(instance: Instance, id: string, file: File|Response, options: IFCOptions = {}) {
        const buffer = await file.arrayBuffer();
        // const alert = NotificationController.showNotification('IFC', `Loaded ${id}; processing ${buffer.byteLength} bytes...`);

        const ifcModel = await ifcLoader.parse(buffer);
        ifcModel.name = 'ifcModel';
        ifcModel.rotateX(Math.PI / 2);
        ifcModel.geometry.computeBoundingBox();

        if (!options.at) {
            // @ts-ignore - Coordinates type hint doesn't like variadic arguments :/
            options.at = new Coordinates('EPSG:3946', 1842023, 5173319, 171);
        }
        // @ts-ignore - target is actually optional
        const coordinates = options.at.as(instance.referenceCrs);

        // @ts-ignore - We don't care if geocentric or not, we just want the values!
        ifcModel.position.set(...coordinates._values);
        ifcModel.updateMatrixWorld();

        // alert.dismiss();
        return new Entity3D(ifcModel.uuid, ifcModel);
    },
};
