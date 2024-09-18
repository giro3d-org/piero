import { load } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { type ArrayRowTable } from '@loaders.gl/schema';
import { type TypedArray } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import Fetcher, { type UrlOrData } from '@/utils/Fetcher';
import { PointCloudLoaderImpl } from './core/PointCloudLoader';
import { Loader } from './core/LoaderCore';
import type {
    CSVPointCloudDatasetConfig,
    CSVPointCloudDatasetSourceConfig,
} from '@/types/configuration/datasets/CSVPointCloud';
import type { DatasetBase } from '@/types/Dataset';

/**
 * Fetches data via loaders.gl loader.
 * @param url - URL to load or Blob
 * @returns Flat array of 3D points
 */
async function fetchCSV(url: UrlOrData): Promise<TypedArray> {
    const raw = (await load(url, CSVLoader, {
        fetch: Fetcher.fetch,
        csv: { shape: 'array-row-table' },
    })) as ArrayRowTable;

    const posArray = new Float32Array(raw.data.length * 3);
    for (let i = 0; i < raw.data.length; i += 1) {
        posArray[i * 3 + 0] = raw.data[i][0];
        posArray[i * 3 + 1] = raw.data[i][1];
        posArray[i * 3 + 2] = raw.data[i][2];
    }
    return posArray;
}

/**
 * CSV Point cloud internal loader
 */
export const CSVPointCloudLoaderImpl = {
    fetch: fetchCSV,
};

/**
 * CSV Point cloud loader
 */
export class CSVPointCloudLoader extends Loader<
    'pointcloud-csv',
    CSVPointCloudDatasetConfig,
    Entity3D
> {
    async loadOne(
        instance: Instance,
        source: CSVPointCloudDatasetSourceConfig,
        dataset: DatasetBase<CSVPointCloudDatasetConfig>,
    ): Promise<Entity3D> {
        const data = await CSVPointCloudLoaderImpl.fetch(source.url);
        const implParameters = PointCloudLoaderImpl.getImplParameters(instance, source, dataset);
        const entity = PointCloudLoaderImpl.toEntity(data, implParameters);
        return entity;
    }
}
