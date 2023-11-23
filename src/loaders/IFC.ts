import { IFCLoader, IFCModel } from 'three/examples/jsm/loaders/IFCLoader.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Instance from '@giro3d/giro3d/core/Instance';
import { IFCBUILDING } from 'web-ifc';
import { Vector3 } from 'three';
import { getPublicFolderUrl } from '@/utils/Configuration';

const ifcLoader = new IFCLoader();
// @ts-ignore - Don't need to set other settings
ifcLoader.ifcManager.applyWebIfcConfig({
    COORDINATE_TO_ORIGIN: true,
});
ifcLoader.ifcManager.setWasmPath(getPublicFolderUrl(''));

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
        const position = options.at.as(instance.referenceCrs).xyz(new Vector3());

        // const offset = config.ifc_offset;
        // position.add(new Vector3(offset.x, offset.y, offset.z));

        // @ts-ignore - We don't care if geocentric or not, we just want the values!
        ifcModel.position.copy(position);
        ifcModel.updateWorldMatrix(true, true);

        const buildings = ifcModel.ifcManager.getAllItemsOfType(ifcModel.modelID, IFCBUILDING, false);

        const props = ifcModel.ifcManager.getItemProperties(ifcModel.modelID, buildings[0], false);

        ifcModel.name = props?.Name?.value ?? 'ifcModel';

        return new Entity3D(ifcModel.uuid, ifcModel);
    },
};
