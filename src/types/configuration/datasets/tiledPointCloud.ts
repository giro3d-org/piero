import type { DatasetConfigBase, DatasetConfigMaskingMixin } from './core';
import type { TiledPointCloudSource } from '@/giro3d/entities/TiledPointCloudEntity';

/** 3D-Tiles PointCloud source configuration */
export interface TiledPointCloudSourceConfig extends Omit<TiledPointCloudSource, 'name'> {}

/** 3D-Tiles PointCloud dataset configuration */
export interface TiledPointCloudDatasetConfig
    extends DatasetConfigBase<'pointcloud'>,
        DatasetConfigMaskingMixin {
    source: TiledPointCloudSourceConfig;
}
