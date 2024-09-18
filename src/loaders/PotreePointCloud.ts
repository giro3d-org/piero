import type Instance from '@giro3d/giro3d/core/Instance';
import PotreePointCloud from '@giro3d/giro3d/entities/PotreePointCloud';
import PotreeSource from '@giro3d/giro3d/sources/PotreeSource';

import LoaderCore from './core/LoaderCore';
import type { PotreePointCloudDatasetConfig } from '@/types/configuration/datasets/PotreePointCloud';
import type { DatasetBase } from '@/types/Dataset';

/**
 * Potree point cloud loader
 */
export class PotreePointCloudLoader extends LoaderCore<
    'potree',
    PotreePointCloudDatasetConfig,
    PotreePointCloud
> {
    load(
        instance: Instance,
        dataset: DatasetBase<PotreePointCloudDatasetConfig>,
    ): Promise<PotreePointCloud> {
        const pointcloud = new PotreePointCloud(
            new PotreeSource(dataset.config.source.url, dataset.config.source.filename),
        );
        this._fillObject3DUserData(pointcloud, { filename: dataset.config.source.url });
        return Promise.resolve(pointcloud);
    }
}
