import { load } from '@loaders.gl/core';
import { GeoPackageLoader as GeoPackageGLLoader } from '@loaders.gl/geopackage';
import { type GeoJSONTable, type Tables } from '@loaders.gl/schema';
import { type Group } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';

import Fetcher, { type UrlOrData } from '@/utils/Fetcher';
import { GeoJSONLoaderImpl } from './GeoJSON';
import { LoaderMultiple } from './core/LoaderCore';
import { OLLoaderImpl } from './core/OLLoader';
import type { GeopackageDatasetConfig } from '@/types/configuration/datasets/Geopackage';
import type { DatasetConfigWithSingleUrlOrData } from '@/types/configuration/datasets/core/baseConfig';
import type { DatasetBase } from '@/types/Dataset';

/** Parameters for creating Geopackage entities */
export interface GeopackageImplParameters {
    featureProjection: string;
}

/**
 * Fetches data via loaders.gl loader.
 * @param url - URL to load or Blob
 * @param parameters - Parameters
 * @returns Array of GeoJSON features
 */
async function fetchGpgk(
    url: UrlOrData,
    parameters: GeopackageImplParameters,
): Promise<GeoJSON.Feature[]> {
    const raw = (await load(url, GeoPackageGLLoader, {
        fetch: Fetcher.fetch,
        gis: {
            format: 'geojson',
            reproject: true,
            _targetCrs: parameters.featureProjection,
        },
    })) as Tables<GeoJSONTable>;

    const features: GeoJSON.Feature[] = [];
    for (const [table, array] of Object.entries(raw.tables)) {
        for (const feature of array.table.features) {
            if (!feature.properties) feature.properties = {};
            feature.properties['table'] = table;
            features.push(feature);
        }
    }
    return features;
}

/**
 * Geopackage internal loader.
 * @see GeoJSONLoaderImpl for post-processing
 */
export const GeopackageLoaderImpl = {
    fetch: fetchGpgk,
};

/**
 * Geopackage loader.
 */
export class GeopackageLoader extends LoaderMultiple<GeopackageDatasetConfig> {
    async loadOne(
        instance: Instance,
        config: GeopackageDatasetConfig & DatasetConfigWithSingleUrlOrData,
        dataset: DatasetBase<GeopackageDatasetConfig>,
    ): Promise<Group> {
        // First, get the data as a list of GeoJSON features
        const features = await GeopackageLoaderImpl.fetch(config.url, {
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
