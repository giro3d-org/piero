import type { DatasetConfigWithSingleUrlOrData } from './core/baseConfig';
import type { PointCloudDatasetConfig } from './core/pointcloud';

export interface LASDatasetConfig
    extends PointCloudDatasetConfig<'las'>,
        DatasetConfigWithSingleUrlOrData {}
