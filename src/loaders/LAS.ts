import { LASLoader as LASGLLoader } from '@loaders.gl/las';
import { load } from '@loaders.gl/core';
import { type TypedArray } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import Fetcher, { type UrlOrData } from '@/utils/Fetcher';
import { PointCloudLoaderImpl } from './core/PointCloudLoader';
import { Loader } from './core/LoaderCore';
import type { LASDatasetConfig } from '@/types/configuration/datasets/LAS';
import type { DatasetConfigWithSingleUrlOrData } from '@/types/configuration/datasets/core/baseConfig';
import type { DatasetBase } from '@/types/Dataset';

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
 * LAS internal loader
 */
export const LASLoaderImpl = {
    fetch: fetchLAS,
};

/**
 * LAS loader
 */
export class LASLoader extends Loader<LASDatasetConfig, Entity3D> {
    async loadOne(
        instance: Instance,
        config: LASDatasetConfig & DatasetConfigWithSingleUrlOrData,
        dataset: DatasetBase<LASDatasetConfig>,
    ): Promise<Entity3D> {
        const data = await LASLoaderImpl.fetch(config.url);
        const implParameters = PointCloudLoaderImpl.getImplParameters(instance, config, dataset);
        const entity = PointCloudLoaderImpl.toEntity(data, implParameters);
        return entity;
    }
}
