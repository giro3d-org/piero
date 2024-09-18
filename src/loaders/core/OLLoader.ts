import FeatureFormat from 'ol/format/Feature';
import { Group } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';

import Fetcher from '@/utils/Fetcher';
import OLFeatures, { type SimpleFeature } from '@/utils/OLFeatures';
import { LoaderMultiple } from './LoaderCore';
import type {
    DatasetSourceConfigBase,
    DatasetSourceConfigDataProjection,
    DatasetSourceConfigElevation,
} from '@/types/configuration/datasets/core/baseConfig';
import type {
    DatasetConfig,
    DatasetSourceConfig,
    DatasetType,
} from '@/types/configuration/datasets';
import { VectorSourceAsMeshConfig } from '@/types/configuration/sources/core/vector';
import { VectorAsMeshDatasetConfigBase } from '@/types/configuration/datasets/core/vector';

export interface OLLoaderImplParameters
    extends DatasetSourceConfigDataProjection,
        DatasetSourceConfigElevation {
    featureProjection: string;
}

/**
 * Converts loaded data into OpenLayers {@link SimpleFeature}s.
 * Will handle reprojection if needed.
 * Will fetch elevation if `parameters.fetchElevation` is `true`.
 *
 * @param data - Loaded data
 * @param format - OpenLayers format used for decoding `data`
 * @param parameters - Loader parameters
 * @returns Array of simple features, where unsupported features are discarded
 */
async function toFeatures(
    data: string,
    format: FeatureFormat,
    parameters: OLLoaderImplParameters,
): Promise<SimpleFeature[]> {
    const olFeatures = await OLFeatures.readSimpleFeatures(
        data,
        format,
        parameters.dataProjection ?? 'EPSG:4326',
        parameters.featureProjection,
    );

    if (parameters.fetchElevation ?? false) {
        await OLFeatures.fillZCoordinates(
            olFeatures,
            parameters.featureProjection,
            0.1,
            0,
            parameters.fetchElevationFast ?? true,
        );
    }
    return olFeatures;
}

/**
 * Converts {@link SimpleFeature}s into a Three.js `Group`.
 * Assumes features are already in the correct CRS.
 *
 * @param features - Features to convert
 * @param parameters - Loader parameters
 * @returns Group containing all meshes for all features
 */
async function toGroup(
    features: SimpleFeature[],
    parameters: OLLoaderImplParameters,
): Promise<Group> {
    return OLFeatures.toMeshes(features, {
        elevation: parameters.elevation ?? 0,
    });
}

/**
 * OpenLayers loader
 */
export const OLLoaderImpl = {
    fetch: Fetcher.fetchText,
    toFeatures,
    toGroup,
};

/**
 * Base class for Loaders using OpenLayers formats.
 */
export abstract class OLLoader<
    TType extends DatasetType,
    TConfig extends DatasetConfig &
        VectorAsMeshDatasetConfigBase<
            TType,
            DatasetSourceConfigBase<TType> & VectorSourceAsMeshConfig
        >,
> extends LoaderMultiple<TType, TConfig> {
    protected _format: FeatureFormat;

    constructor(format: FeatureFormat) {
        super();
        this._format = format;
    }

    async loadOne(
        instance: Instance,
        source: DatasetSourceConfig & DatasetSourceConfigBase<TType> & VectorSourceAsMeshConfig,
    ): Promise<Group> {
        const text = await OLLoaderImpl.fetch(source.url);
        const implParameters: OLLoaderImplParameters = {
            dataProjection: source.dataProjection,
            elevation: source.elevation,
            fetchElevation: source.fetchElevation,
            fetchElevationFast: source.fetchElevationFast,
            featureProjection: instance.referenceCrs,
        };

        const features = await OLLoaderImpl.toFeatures(text, this._format, implParameters);
        const group = await OLLoaderImpl.toGroup(features, implParameters);
        return group;
    }
}
