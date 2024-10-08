import type { SourceConfigUrlMixin } from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigBase, DatasetSourceConfigBase } from './core';

/** Potree PointCloud source configuration */
export interface PotreePointCloudDatasetSourceConfig
    extends DatasetSourceConfigBase<'potree'>,
        SourceConfigUrlMixin {
    filename?: string;
}

/** Potree PointCloud dataset configuration */
export interface PotreePointCloudDatasetConfig extends DatasetConfigBase<'potree'> {
    source: PotreePointCloudDatasetSourceConfig;
}
