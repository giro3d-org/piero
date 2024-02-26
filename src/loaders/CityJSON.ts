import { CityJSONLoader, CityJSONWorkerParser } from 'cityjson-threejs-loader';
import Instance from '@giro3d/giro3d/core/Instance.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import CityJSONEntity from '@/giro3d/CityJSONEntity';

import Fetcher, { UrlOrBlob } from '@/utils/Fetcher';
import Projections from '@/utils/Projections';
import loader from './loader';

/** Parameters for creating CityJSON object */
export type CityJSONParameters = {
    /** Projection to use (if not provided in the file) */
    projection?: string;
};

export default {
    async load(
        instance: Instance,
        url: UrlOrBlob,
        parameters: CityJSONParameters = {},
    ): Promise<CityJSONEntity> {
        const data = await Fetcher.json(url);
        const entity = await this.loadJson(instance, data, parameters);
        loader.fillOrigin(entity.object3d, url);
        return entity;
    },

    async loadJson(
        instance: Instance,
        json: any,
        parameters: CityJSONParameters = {},
    ): Promise<CityJSONEntity> {
        return new Promise<CityJSONEntity>(resolve => {
            const parser = new CityJSONWorkerParser();
            const loader = new CityJSONLoader(parser);

            parser.chunkSize = 2000;
            parser.onComplete = () => {
                loader.scene.updateMatrix();
                loader.scene.updateMatrixWorld(true);
                resolve(new CityJSONEntity(loader));
            };

            loader.load(json);

            // FIXME: here's a code smell indicating we are not using CityJSON correctly
            let z: number;
            if (json.transform?.translate[2] !== undefined && json.transform?.translate[2] != 0) {
                // Z already taken into account when creating mesh
                z = 0;
            } else if (json.vertices[0][2] != 0) {
                // Z already taken into account in the vertices
                z = 0;
            } else {
                // We have to take Z into account - FIXME
                z =
                    json.metadata?.geographicalExtent[5] -
                    (json.CityObjects['1']?.attributes['ArrDissolve-LoD12.global_elevation_max']
                        ? json.CityObjects['1'].attributes['ArrDissolve-LoD12.global_elevation_max']
                        : 0);
            }

            const m = loader.matrix.toArray();
            const projection =
                json?.metadata?.referenceSystem ?? parameters.projection ?? instance.referenceCrs;

            Projections.loadProjCrsIfNeeded(projection).then(proj => {
                if (proj) {
                    const coords = new Coordinates(proj, -m[12], -m[13], z);
                    const coordsReference = coords.as(instance.referenceCrs);
                    loader.scene.position.set(
                        coordsReference.values[0],
                        coordsReference.values[1],
                        coordsReference.values[2],
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
