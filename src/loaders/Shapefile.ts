import { load } from '@loaders.gl/core';
import { ShapefileLoader as ShapefileGLLoader } from '@loaders.gl/shapefile';
import { type Group } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';

import { GeoJSONLoaderImpl, type GeoJSONParameters, type GeoJSONImplParameters } from './GeoJSON';
import { LoaderMultiple, type UrlParams } from './core/LoaderCore';
import { OLLoaderImpl } from './core/OLLoader';
import Fetcher, { type UrlOrData } from '@/utils/Fetcher';

export type ShapefileParameters = Omit<GeoJSONParameters, 'dataProjection'>;
export type ShapefileImplParameters = {
    featureProjection: string;
};

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
 * Shapefile loader.
 * @see GeoJSONLoaderImpl for post-processing
 */
export const ShapefileLoaderImpl = {
    fetch: fetchShp,
};

/**
 * Shapefile loader.
 */
export class ShapefileLoader extends LoaderMultiple<ShapefileParameters> {
    async loadOne(
        instance: Instance,
        { url, ...parameters }: ShapefileParameters & UrlParams,
    ): Promise<Group> {
        const features = await ShapefileLoaderImpl.fetch(url, {
            featureProjection: instance.referenceCrs,
        });
        const implParameters: GeoJSONImplParameters = {
            ...parameters,
            dataProjection: instance.referenceCrs,
            featureProjection: instance.referenceCrs,
        };
        const olFeatures = await GeoJSONLoaderImpl.toOlFeatures(features, implParameters);
        const group = await OLLoaderImpl.toGroup(olFeatures, implParameters);
        return group;
    }
}
