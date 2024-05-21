import {
    CityJSONLoader as CityJSONThreeLoader,
    CityJSONWorkerParser,
} from 'cityjson-threejs-loader';
import type Instance from '@giro3d/giro3d/core/Instance';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

import CityJSONEntity from '@/giro3d/CityJSONEntity';
import Fetcher from '@/utils/Fetcher';
import Projections from '@/utils/Projections';
import { Loader, type UrlParams } from './core/LoaderCore';

/** Parameters for creating CityJSON objects */
export type CityJSONParameters = {
    /** Projection to use (if not provided in the file) */
    dataProjection?: string;
};

export type CityJSONImplParameters = CityJSONParameters & {
    featureProjection: string;
};

/**
 * Converts a loaded CityJSON model into an Entity
 *
 * @param json - CityJSON model
 * @param parameters - Loader parameters
 * @returns CityJSON entity
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEntity(json: any, parameters: CityJSONImplParameters): Promise<CityJSONEntity> {
    return new Promise<CityJSONEntity>(resolve => {
        const parser = new CityJSONWorkerParser();
        const loader = new CityJSONThreeLoader(parser);

        parser.chunkSize = 2000;
        parser.onComplete = () => {
            loader.scene.updateMatrix();
            loader.scene.updateMatrixWorld(true);
            resolve(new CityJSONEntity(loader));
        };

        loader.load(json);

        // FIXME: here's a code smell indicating we are not using CityJSON correctly
        let z = 0;
        if (json.transform?.translate?.at(2) != null && json.transform?.translate.at(2) !== 0) {
            // Z already taken into account when creating mesh
            z = 0;
        } else if (json.vertices?.at(0)?.at(2) !== 0) {
            // Z already taken into account in the vertices
            z = 0;
        } else if (json.metadata?.geographicalExtent?.at(5) != null) {
            // We have to take Z into account - FIXME
            z =
                json.metadata?.geographicalExtent[5] -
                json.CityObjects?.['1']?.attributes?.['ArrDissolve-LoD12.global_elevation_max']
                    ? json.CityObjects?.['1']?.attributes?.[
                          'ArrDissolve-LoD12.global_elevation_max'
                      ]
                    : 0;
        }

        const m = loader.matrix.toArray();
        const projection =
            json?.metadata?.referenceSystem ??
            parameters.dataProjection ??
            parameters.featureProjection;

        Projections.loadProjCrsIfNeeded(projection).then(proj => {
            if (proj) {
                const coords = new Coordinates(proj, -m[12], -m[13], z);
                const coordsReference = coords.as(parameters.featureProjection);
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
}

/**
 * CityJSON loader
 */
export const CityJSONLoaderImpl = {
    fetch: Fetcher.fetchJson,
    toEntity,
};

/**
 * CityJSON loader
 */
export class CityJSONLoader extends Loader<CityJSONParameters, CityJSONEntity> {
    async loadOne(
        instance: Instance,
        { url, ...parameters }: CityJSONParameters & UrlParams,
    ): Promise<CityJSONEntity> {
        const json = await CityJSONLoaderImpl.fetch(url);
        const entity = await CityJSONLoaderImpl.toEntity(json, {
            ...parameters,
            featureProjection: instance.referenceCrs,
        });
        return entity;
    }
}
