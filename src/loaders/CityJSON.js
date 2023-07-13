import { CityJSONLoader, CityJSONWorkerParser } from 'cityjson-threejs-loader';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Projections from '../Projections.js';
import Alerts from '../Alerts.js';

export default {
    loadString(instance, id, str, options = {}) {
        return new Promise(resolve => {
            const json = JSON.parse(str);
            const alert = Alerts.showAlert(`Loaded ${id}; processing ${Object.keys(json.CityObjects).length} buildings...`, 'info');
            const parser = new CityJSONWorkerParser();
            const loader = new CityJSONLoader(parser);

            parser.chunkSize = 2000;
            parser.onComplete = () => {
                loader.scene.updateMatrix();
                loader.scene.updateMatrixWorld(true);
                alert.dismiss();
                resolve(new Entity3D(loader.scene.uuid, loader.scene));
            };

            parser.resetMaterial();
            loader.load(json);

            let z;
            // eslint-disable-next-line eqeqeq
            if (json.transform?.translate[2] !== undefined && json.transform?.translate[2] != 0) {
                // Z already taken into account when creating mesh
                z = 0;
            // eslint-disable-next-line eqeqeq
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
                    loader.scene.position.set(
                        coordsReference._values[0],
                        coordsReference._values[1],
                        coordsReference._values[2],
                    );
                } else {
                    loader.scene.position.set(-m[12], -m[13], z);
                }
                loader.scene.updateMatrix();
                loader.scene.updateMatrixWorld(true);
            });
        });
    },
};
