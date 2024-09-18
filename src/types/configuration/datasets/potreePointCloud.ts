import type { SourceConfigUrlMixin } from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigWithSourceBase, DatasetSourceConfigBase } from './core/baseConfig';

/** Potree PointCloud source configuration */
export interface PotreePointCloudDatasetSourceConfig
    extends DatasetSourceConfigBase<'potree'>,
        SourceConfigUrlMixin {
    filename?: string;
}

/** Potree PointCloud dataset configuration */
export interface PotreePointCloudDatasetConfig
    extends DatasetConfigWithSourceBase<'potree', PotreePointCloudDatasetSourceConfig> {}
