import type { PointCloudSourceOptions } from '@/giro3d/entities/PointCloudEntity';
import type { DatasetConfigBase, DatasetConfigMaskingMixin, DatasetSourceConfigBase } from './core';

export interface CSVPointCloudSourceConfig
    extends DatasetSourceConfigBase<'csv'>,
        Omit<PointCloudSourceOptions, 'featureProjection'> {}

export interface LASPointCloudSourceConfig
    extends DatasetSourceConfigBase<'las'>,
        Omit<PointCloudSourceOptions, 'featureProjection'> {}

export type PointCloudSourceConfig = CSVPointCloudSourceConfig | LASPointCloudSourceConfig;

export interface PointCloudDatasetConfig
    extends DatasetConfigBase<'flatPointcloud'>,
        DatasetConfigMaskingMixin {
    source: PointCloudSourceConfig;
}
