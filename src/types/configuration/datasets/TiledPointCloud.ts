import type { DatasetConfigBase, DatasetConfigWithSingleUrl } from './core/baseConfig';

export interface TiledPointCloudDatasetConfig
    extends DatasetConfigBase<'pointcloud'>,
        DatasetConfigWithSingleUrl {}
