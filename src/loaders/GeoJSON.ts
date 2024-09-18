import GeoJSONFormat from 'ol/format/GeoJSON';
import { type Group } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';

import Fetcher from '@/utils/Fetcher';
import OLFeatures, { type SimpleFeature } from '@/utils/OLFeatures';
import Projections from '@/utils/Projections';
import { LoaderMultiple } from './core/LoaderCore';
import { OLLoaderImpl, type OLLoaderImplParameters } from './core/OLLoader';
import type { GeoJSONDatasetConfig } from '@/types/configuration/datasets/GeoJSON';
import type {
    DatasetConfigWithDataProjection,
    DatasetConfigWithElevation,
    DatasetConfigWithSingleUrlOrData,
} from '@/types/configuration/datasets/core/baseConfig';
import type { Dataset, DatasetBase } from '@/types/Dataset';

/** Dataset configuration usable with {@link getImplParameters} */
export interface GeoJSONCompatibleDatasetConfig
    extends DatasetConfigWithDataProjection,
        DatasetConfigWithElevation {}

/** Parameters for creating GeoJSON entities */
export interface GeoJSONImplParameters extends OLLoaderImplParameters {}

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

function getImplParameters<TConfig extends GeoJSONCompatibleDatasetConfig>(
    instance: Instance,
    parameters: TConfig,
    dataset: Dataset,
): GeoJSONImplParameters {
    return {
        dataProjection: parameters.dataProjection ?? dataset.get('dataProjection'),
        elevation: parameters.elevation ?? dataset.get('elevation'),
        fetchElevation: parameters.fetchElevation ?? dataset.get('fetchElevation'),
        fetchElevationFast: parameters.fetchElevationFast ?? dataset.get('fetchElevationFast'),
        featureProjection: instance.referenceCrs,
    };
}

/**
 * GeoJSON internal loader
 */
export const GeoJSONLoaderImpl = {
    fetch: Fetcher.fetchJson<GeoJSON.GeoJSON>,
    toGeoJSONFeatures,
    toOlFeatures,
    getImplParameters,
};

/**
 * GeoJSON loader
 */
export class GeoJSONLoader extends LoaderMultiple<GeoJSONDatasetConfig> {
    async loadOne(
        instance: Instance,
        config: GeoJSONDatasetConfig & DatasetConfigWithSingleUrlOrData,
        dataset: DatasetBase<GeoJSONDatasetConfig>,
    ): Promise<Group> {
        // First, get the data as GeoJSON
        const json = await GeoJSONLoaderImpl.fetch(config.url);

        // Convert them into a list of GeoJSON features
        const features = GeoJSONLoaderImpl.toGeoJSONFeatures(json);

        // Convert them into OpenLayers features
        const implParameters = getImplParameters(instance, config, dataset);
        const olFeatures = await GeoJSONLoaderImpl.toOlFeatures(features, implParameters);

        // And create our ThreeJS Group
        const group = await OLLoaderImpl.toGroup(olFeatures, implParameters);
        return group;
    }
}
