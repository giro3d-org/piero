import type { PointCloudSourceOptions } from '@/giro3d/entities/PointCloudEntity';
import type { DatasetConfigBase, DatasetConfigMaskingMixin, DatasetSourceConfigBase } from './core';

export interface CSVPointCloudSourceConfig
    extends DatasetSourceConfigBase<'csv'>,
        PointCloudSourceOptions {}

export interface COPCPointCloudSourceConfig
    extends DatasetSourceConfigBase<'copc'>,
        PointCloudSourceOptions {}

export interface LASPointCloudSourceConfig
    extends DatasetSourceConfigBase<'las'>,
        PointCloudSourceOptions {}

export type PointCloudSourceConfig =
    | CSVPointCloudSourceConfig
    | LASPointCloudSourceConfig
    | COPCPointCloudSourceConfig;

export interface PointCloudDatasetConfig
    extends DatasetConfigBase<'flatPointcloud'>,
        DatasetConfigMaskingMixin {
    source: PointCloudSourceConfig;
}
