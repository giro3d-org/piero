import { load } from '@loaders.gl/core';
import { GeoPackageLoader as GeoPackageGLLoader } from '@loaders.gl/geopackage';
import { type GeoJSONTable, type Tables } from '@loaders.gl/schema';
import { type Group } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';

import Fetcher, { type UrlOrData } from '@/utils/Fetcher';
import { GeoJSONLoaderImpl, type GeoJSONParameters, type GeoJSONImplParameters } from './GeoJSON';
import { LoaderMultiple, type UrlParams } from './core/LoaderCore';
import { OLLoaderImpl } from './core/OLLoader';

export type GeopackageParameters = Omit<GeoJSONParameters, 'dataProjection'>;
export type GeopackageImplParameters = {
    featureProjection: string;
};

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
 * Geopackage loader.
 * @see GeoJSONLoaderImpl for post-processing
 */
export const GeopackageLoaderImpl = {
    fetch: fetchGpgk,
};

/**
 * Geopackage loader.
 */
export class GeopackageLoader extends LoaderMultiple<GeopackageParameters> {
    async loadOne(
        instance: Instance,
        { url, ...parameters }: GeoJSONParameters & UrlParams,
    ): Promise<Group> {
        const features = await GeopackageLoaderImpl.fetch(url, {
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
