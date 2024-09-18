import { load } from '@loaders.gl/core';
import { ShapefileLoader as ShapefileGLLoader } from '@loaders.gl/shapefile';
import { type Group } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';

import { GeoJSONLoaderImpl } from './GeoJSON';
import { LoaderMultiple } from './core/LoaderCore';
import { OLLoaderImpl } from './core/OLLoader';
import Fetcher, { type UrlOrData } from '@/utils/Fetcher';
import type { ShapefileDatasetConfig } from '@/types/configuration/datasets/Shapefile';
import type { DatasetConfigWithSingleUrlOrData } from '@/types/configuration/datasets/core/baseConfig';
import type { DatasetBase } from '@/types/Dataset';

/** Parameters for creating Shapefile entities */
export interface ShapefileImplParameters {
    featureProjection: string;
}

/**
 * Fetches data via loaders.gl loader.
 * @param url - URL to load or Blob
 * @param parameters - Parameters
 * @returns Array of GeoJSON features
 */
async function fetchShp(
    url: UrlOrData,
    parameters: ShapefileImplParameters,
): Promise<GeoJSON.Feature[]> {
    const raw = await load(url, ShapefileGLLoader, {
        fetch: Fetcher.fetch,
        shapefile: {
            shape: 'geojson-table',
        },
        gis: {
            format: 'geojson',
            reproject: true,
            _targetCrs: parameters.featureProjection,
        },
    });

    return raw.features;
}

/**
 * Shapefile internal loader.
 * @see GeoJSONLoaderImpl for post-processing
 */
export const ShapefileLoaderImpl = {
    fetch: fetchShp,
};

/**
 * Shapefile loader.
 */
export class ShapefileLoader extends LoaderMultiple<ShapefileDatasetConfig> {
    async loadOne(
        instance: Instance,
        config: ShapefileDatasetConfig & DatasetConfigWithSingleUrlOrData,
        dataset: DatasetBase<ShapefileDatasetConfig>,
    ): Promise<Group> {
        // First, get the data as a list of GeoJSON features
        const features = await ShapefileLoaderImpl.fetch(config.url, {
            featureProjection: instance.referenceCrs,
        });

        // Convert them into OpenLayers features
        const implParameters = GeoJSONLoaderImpl.getImplParameters(instance, config, dataset);
        const olFeatures = await GeoJSONLoaderImpl.toOlFeatures(features, implParameters);

        // And create our ThreeJS Group
        const group = await OLLoaderImpl.toGroup(olFeatures, implParameters);
        return group;
    }
}
