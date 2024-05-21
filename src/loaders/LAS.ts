import { LASLoader as LASGLLoader } from '@loaders.gl/las';
import { load } from '@loaders.gl/core';
import { type TypedArray } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import Fetcher, { type UrlOrData } from '@/utils/Fetcher';
import {
    PointCloudLoaderImpl,
    type PointCloudLoaderParameters,
    type PointCloudLoaderImplParameters,
} from './core/PointCloudLoader';
import { Loader, type UrlParams } from './core/LoaderCore';

/**
 * Fetches data via loaders.gl loader.
 * @param url - URL to load or Blob
 * @returns Flat array of 3D points
 */
async function fetchLAS(url: UrlOrData): Promise<TypedArray> {
    const raw = await load(url, LASGLLoader, {
        fetch: Fetcher.fetch,
        las: { shape: 'columnar-table' },
    });

    return raw.attributes.POSITION.value;
}

/**
 * LAS loader
 */
export const LASLoaderImpl = {
    fetch: fetchLAS,
};

/**
 * LAS loader
 */
export class LASLoader extends Loader<PointCloudLoaderParameters, Entity3D> {
    async loadOne(
        instance: Instance,
        { url, ...parameters }: PointCloudLoaderParameters & UrlParams,
    ): Promise<Entity3D> {
        const implParameters: PointCloudLoaderImplParameters = {
            ...parameters,
            featureProjection: instance.referenceCrs,
        };
        const data = await LASLoaderImpl.fetch(url);
        const entity = PointCloudLoaderImpl.toEntity(data, implParameters);
        return entity;
    }
}
