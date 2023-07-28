import { IFCLoader } from 'three/examples/jsm/loaders/IFCLoader.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Alerts from '../Alerts.js';

/* eslint-disable jsdoc/valid-types */
/**
 * @typedef {import('@giro3d/giro3d/core/Instance').default} Instance
 */
/* eslint-enable */

const ifcLoader = new IFCLoader();
// @ts-ignore - Don't need to set other settings
ifcLoader.ifcManager.applyWebIfcConfig({
    COORDINATE_TO_ORIGIN: true,
});
// By default ifcManager searches wasm in node_modules/.... and doesn't like '/'...
ifcLoader.ifcManager.setWasmPath('../../../../../../');

/**
 * IFC options
 *
 * @typedef {object} IFCOptions
 * @property {Coordinates} [at] Coordinates where to place the IFC
 */

export default {
    /**
     * Loads a CityJSON file as a string.
     *
     * @param {Instance} instance Giro3d instance
     * @param {string} id Layer id
     * @param {File|Response} file IFC file
     * @param {IFCOptions} options Options
     * @returns {Promise<Entity3D>} Entity created
     */
    async loadIfc(instance, id, file, options = {}) {
        const buffer = await file.arrayBuffer();
        const alert = Alerts.showAlert(`Loaded ${id}; processing ${buffer.byteLength} bytes...`, null);

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

        alert.dismiss();
        return new Entity3D(ifcModel.uuid, ifcModel);
    },
};
