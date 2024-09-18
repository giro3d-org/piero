import type { DatasetConfigWithSingleUrlOrData } from './core/baseConfig';
import type { PointCloudDatasetConfig } from './core/pointcloud';

export interface CSVPointCloudDatasetConfig
    extends PointCloudDatasetConfig<'pointcloud-csv'>,
        DatasetConfigWithSingleUrlOrData {}
