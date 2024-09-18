import type Instance from '@giro3d/giro3d/core/Instance';
import PotreePointCloud from '@giro3d/giro3d/entities/PotreePointCloud';
import { PotreeSource } from '@giro3d/giro3d/sources';
import { MathUtils } from 'three';

import LoaderCore from './core/LoaderCore';
import type { PotreePointcCloudDatasetConfig } from '@/types/configuration/datasets/PotreePointCloud';
import type { DatasetBase } from '@/types/Dataset';

/**
 * Potree point cloud loader
 */
export class PotreePointCloudLoader extends LoaderCore<
    PotreePointcCloudDatasetConfig,
    PotreePointCloud
> {
    load(
        instance: Instance,
        dataset: DatasetBase<PotreePointcCloudDatasetConfig>,
    ): Promise<PotreePointCloud> {
        const pointcloud = new PotreePointCloud(
            MathUtils.generateUUID(),
            new PotreeSource(dataset.config.url, dataset.config.filename),
        );
        this._fillObject3DUserData(pointcloud, { filename: dataset.config.url });
        return Promise.resolve(pointcloud);
    }
}
