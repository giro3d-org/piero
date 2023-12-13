import { CityJSONLoader, CityJSONWorkerParser } from 'cityjson-threejs-loader';
import Instance from '@giro3d/giro3d/core/Instance.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Projections from '../utils/Projections';

/**
 * CityJSON options
 */
export type CityJSONOptions = {
    projection?: string;
}

export default {
    /**
     * Loads a CityJSON file as a string.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param str CityJSON content
     * @param options Options
     * @returns Entity created
     */
    loadString(instance: Instance, id: string, str: string, options: CityJSONOptions = {}): Promise<Entity3D> {
        return new Promise(resolve => {
            const json = JSON.parse(str);
            // const alert = NotificationController.showNotification('CityJSON', `Loaded ${id}; processing ${Object.keys(json.CityObjects).length} buildings...`);
            const parser = new CityJSONWorkerParser();
            // @ts-ignore - CityJSON typing seems outdated
            const loader = new CityJSONLoader(parser);

            parser.chunkSize = 2000;
            parser.onComplete = () => {
                loader.scene.updateMatrix();
                loader.scene.updateMatrixWorld(true);
                // alert.dismiss();
                resolve(new Entity3D(loader.scene.uuid, loader.scene));
            };

            // @ts-ignore - CityJSON typing seems outdated
            parser.resetMaterial();
            loader.load(json);

            let z: number;
            if (json.transform?.translate[2] !== undefined && json.transform?.translate[2] != 0) {
                // Z already taken into account when creating mesh
                z = 0;
            } else if (json.vertices[0][2] != 0) {
                // Z already taken into account in the vertices
                z = 0;
            } else {
                // We have to take Z into account - FIXME
                z = json.metadata?.geographicalExtent[5] - (json.CityObjects['1']?.attributes['ArrDissolve-LoD12.global_elevation_max'] ? json.CityObjects['1'].attributes['ArrDissolve-LoD12.global_elevation_max'] : 0);
            }

            const m = loader.matrix.toArray();
            const projection = json?.metadata?.referenceSystem ?? options?.projection;

            Projections.loadProjCrsIfNeeded(projection).then(proj => {
                if (proj) {
                    const coords = new Coordinates(`EPSG:${proj}`, -m[12], -m[13], z);
                    const coordsReference = coords.as(instance.referenceCrs);
                    // @ts-ignore - We don't care if geocentric or not, we just want the values!
                    loader.scene.position.set(...coordsReference._values);
                } else {
                    loader.scene.position.set(-m[12], -m[13], z);
                }
                loader.scene.updateMatrix();
                loader.scene.updateMatrixWorld(true);
            });
        });
    },
};
