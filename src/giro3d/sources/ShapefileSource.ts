import { load } from '@loaders.gl/core';
import { ShapefileLoader as ShapefileGLLoader } from '@loaders.gl/shapefile';

import Fetcher, { FetchContext, UrlOrData } from '@/utils/Fetcher';
import { SimpleFeature } from '@/utils/OLFeatures';
import { geojsonToOlFeatures, VectorMeshSource } from '../entities/VectorMeshEntity';
import type {
    DataProjectionMixin,
    ElevationMixin,
    FeatureProjectionMixin,
    UrlOrDataMixin,
} from './mixins';

/**
 * Options for loading Shapefile files into a {@link VectorMeshEntity}
 */
export interface ShapefileSourceParameters
    extends UrlOrDataMixin,
        DataProjectionMixin,
        Required<FeatureProjectionMixin>,
        ElevationMixin {}

/**
 * Fetches data via loaders.gl loader.
 * @param url - URL to load or Blob
 * @param parameters - Parameters
 * @returns Array of GeoJSON features
 */
async function fetchShapefile(
    url: UrlOrData,
    featureProjection: string,
): Promise<GeoJSON.Feature[]> {
    const raw = await load(url, ShapefileGLLoader, {
        fetch: Fetcher.fetch,
        shapefile: {
            shape: 'geojson-table',
        },
        gis: {
            format: 'geojson',
            reproject: true,
            _targetCrs: featureProjection,
        },
    });

    return raw.features;
}

/**
 * Source for loading a Shapefile file into a {@link VectorMeshEntity}
 */
export default class ShapefileSource implements VectorMeshSource {
    elevation?: number;
    readonly options: ShapefileSourceParameters;

    constructor(options: ShapefileSourceParameters) {
        this.options = options;
        this.elevation = options.elevation;
    }

    async load(): Promise<SimpleFeature[]> {
        // First, get the data as a list of GeoJSON features
        const features = await fetchShapefile(this.options.url, this.options.featureProjection);
        // Convert them into OpenLayers features
        const olFeatures = await geojsonToOlFeatures(features, {
            ...this.options,
            dataProjection: this.options.featureProjection, // Already re-projected
        });
        return olFeatures;
    }

    context(): FetchContext {
        return Fetcher.getContext(this.options.url);
    }
}
