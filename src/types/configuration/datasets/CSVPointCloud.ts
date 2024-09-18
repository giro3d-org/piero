import type {
    DatasetSourceConfigUrlOrData,
    DatasetSourceConfigBase,
    DatasetConfigBaseWithSource,
    DatasetSourceConfigDataProjection,
} from './core/baseConfig';

export interface CSVPointCloudDatasetSourceConfig
    extends DatasetSourceConfigBase<'pointcloud-csv'>,
        DatasetSourceConfigUrlOrData,
        DatasetSourceConfigDataProjection {}

export interface CSVPointCloudDatasetConfig
    extends DatasetConfigBaseWithSource<'pointcloud-csv', CSVPointCloudDatasetSourceConfig> {}
