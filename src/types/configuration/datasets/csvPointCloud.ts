import type {
    SourceConfigProjectionMixin,
    SourceConfigUrlOrDataMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { DatasetSourceConfigBase, DatasetConfigWithSourceBase } from './core/baseConfig';

/** CSV PointCloud source configuration */
export interface CSVPointCloudDatasetSourceConfig
    extends DatasetSourceConfigBase<'pointcloud-csv'>,
        SourceConfigUrlOrDataMixin,
        SourceConfigProjectionMixin {}

/** CSV PointCloud dataset configuration */
export interface CSVPointCloudDatasetConfig
    extends DatasetConfigWithSourceBase<'pointcloud-csv', CSVPointCloudDatasetSourceConfig> {}
