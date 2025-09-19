import type Instance from '@giro3d/giro3d/core/Instance';

import { load } from '@loaders.gl/core';
import { GeoPackageLoader as GeoPackageGLLoader } from '@loaders.gl/geopackage';
import { type GeoJSONTable, type Tables } from '@loaders.gl/schema';

import type { SimpleFeature } from '@/utils/OLFeatures';

import Fetcher, { type FetchContext, type UrlOrData } from '@/utils/Fetcher';

import type {
    DataProjectionMixin,
    ElevationMixin,
    FeatureProjectionMixin,
    UrlOrDataMixin,
} from './mixins';

import { geojsonToOlFeatures, type VectorMeshSource } from '../entities/VectorMeshEntity';

/**
 * Fetches data via loaders.gl loader.
 * @param url - URL to load or Blob
 * @param parameters - Parameters
 * @returns Array of GeoJSON features
 */
async function fetchGeopackage(
    url: UrlOrData,
    featureProjection: string,
): Promise<GeoJSON.Feature[]> {
    const raw = (await load(url, GeoPackageGLLoader, {
        fetch: Fetcher.fetch,
        gis: {
            _targetCrs: featureProjection,
            format: 'geojson',
            reproject: true,
        },
    })) as Tables<GeoJSONTable>;

    const features: GeoJSON.Feature[] = [];
    for (const [table, array] of Object.entries(raw.tables)) {
        for (const feature of array.table.features) {
            if (!feature.properties) {
                feature.properties = {};
            }
            feature.properties['table'] = table;
            features.push(feature);
        }
    }
    return features;
}

/**
 * Options for loading Geopackage files into a {@link VectorMeshEntity}
 */
export interface GeopackageSourceParameters
    extends DataProjectionMixin,
        ElevationMixin,
        Required<FeatureProjectionMixin>,
        UrlOrDataMixin {}

/**
 * Source for loading a Geopackage file into a {@link VectorMeshEntity}
 */
export default class GeopackageSource implements VectorMeshSource {
    public elevation?: number;
    public readonly options: GeopackageSourceParameters;

    public constructor(options: GeopackageSourceParameters) {
        this.options = options;
        this.elevation = options.elevation;
    }

    public context(): FetchContext {
        return Fetcher.getContext(this.options.url);
    }

    public async load(instance: Instance): Promise<SimpleFeature[]> {
        // First, get the data as a list of GeoJSON features
        const features = await fetchGeopackage(this.options.url, this.options.featureProjection);
        // Convert them into OpenLayers features
        const olFeatures = await geojsonToOlFeatures(instance, features, {
            ...this.options,
            dataProjection: this.options.featureProjection, // Already re-projected
        });
        return olFeatures;
    }
}
