import type {
    DatasetSourceConfigUrl,
    DatasetSourceConfigBase,
    DatasetConfigBaseWithSource,
} from './core/baseConfig';

export interface TiledPointCloudDatasetSourceConfig
    extends DatasetSourceConfigBase<'pointcloud'>,
        DatasetSourceConfigUrl {}

export interface TiledPointCloudDatasetConfig
    extends DatasetConfigBaseWithSource<'pointcloud', TiledPointCloudDatasetSourceConfig> {}
