import GeoJSONFormat from 'ol/format/GeoJSON';
import { type Group } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';

import Fetcher from '@/utils/Fetcher';
import OLFeatures, { type SimpleFeature } from '@/utils/OLFeatures';
import Projections from '@/utils/Projections';
import { LoaderMultiple, type UrlParams } from './core/LoaderCore';
import { OLLoaderImpl, type OLLoaderParameters } from './core/OLLoader';

/** Parameters for creating GeoJSON object */
export type GeoJSONParameters = OLLoaderParameters;

export type GeoJSONImplParameters = GeoJSONParameters & {
    featureProjection: string;
};

const geojsonFormat = new GeoJSONFormat();

/**
 * Converts a GeoJSON object into a list of GeoJSON features
 * @param json - GeoJSON object
 * @returns Array of GeoJSON features
 */
function toGeoJSONFeatures(json: GeoJSON.GeoJSON): GeoJSON.Feature[] {
    switch (json.type) {
        case 'Feature':
            return [json];
        case 'FeatureCollection':
            return json.features;
        case 'GeometryCollection': {
            const features: GeoJSON.Feature[] = json.geometries.map(geometry => ({
                type: 'Feature',
                geometry,
                properties: {},
            }));
            return features;
        }
        default: {
            const feature: GeoJSON.Feature = {
                type: 'Feature',
                geometry: json,
                properties: {},
            };
            return [feature];
        }
    }
}

/**
 * Converts GeoJSON features into OpenLayers features.
 * Will handle reprojection if needed.
 * Will fetch elevation if `parameters.fetchElevation` is `true`.
 *
 * @param features - Array of GeoJSON features
 * @param parameters - Loader parameters
 * @returns Array of simple features, where unsupported features are discarded
 */
async function toOlFeatures(
    features: GeoJSON.Feature[],
    parameters: GeoJSONImplParameters,
): Promise<SimpleFeature[]> {
    const dataProjection = await Projections.loadProjCrsIfNeeded(
        parameters.dataProjection ?? 'EPSG:4326',
    );

    const olFeatures = features.flatMap(f =>
        geojsonFormat.readFeatures(f, {
            dataProjection,
            featureProjection: parameters.featureProjection,
        }),
    );
    const simpleFeatures = OLFeatures.toSimpleFeatures(olFeatures);

    if (parameters.fetchElevation ?? false) {
        await OLFeatures.fillZCoordinates(
            simpleFeatures,
            parameters.featureProjection,
            0.1,
            0,
            parameters.fetchElevationFast ?? true,
        );
    }
    return simpleFeatures;
}

/**
 * GeoJSON loader
 */
export const GeoJSONLoaderImpl = {
    fetch: Fetcher.fetchJson<GeoJSON.GeoJSON>,
    toGeoJSONFeatures,
    toOlFeatures,
};

/**
 * GeoJSON loader
 */
export class GeoJSONLoader extends LoaderMultiple<GeoJSONParameters> {
    async loadOne(
        instance: Instance,
        { url, ...parameters }: GeoJSONParameters & UrlParams,
    ): Promise<Group> {
        const json = await GeoJSONLoaderImpl.fetch(url);
        const features = GeoJSONLoaderImpl.toGeoJSONFeatures(json);
        const implParameters: GeoJSONImplParameters = {
            ...parameters,
            featureProjection: instance.referenceCrs,
        };
        const olFeatures = await GeoJSONLoaderImpl.toOlFeatures(features, implParameters);
        const group = await OLLoaderImpl.toGroup(olFeatures, implParameters);
        return group;
    }
}
