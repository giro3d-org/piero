import type { SourceConfigUrlMixin } from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigWithSourceBase, DatasetSourceConfigBase } from './core/baseConfig';

/** 3D-Tiles PointCloud source configuration */
export interface TiledPointCloudDatasetSourceConfig
    extends DatasetSourceConfigBase<'pointcloud'>,
        SourceConfigUrlMixin {}

/** 3D-Tiles PointCloud dataset configuration */
export interface TiledPointCloudDatasetConfig
    extends DatasetConfigWithSourceBase<'pointcloud', TiledPointCloudDatasetSourceConfig> {}
