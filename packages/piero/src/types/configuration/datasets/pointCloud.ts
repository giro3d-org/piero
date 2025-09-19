import type { PointCloudSourceOptions } from '@/giro3d/entities/PointCloudEntity';

import type { DatasetConfigBase, DatasetConfigMaskingMixin, DatasetSourceConfigBase } from './core';

export interface COPCPointCloudSourceConfig
    extends DatasetSourceConfigBase<'copc'>,
        PointCloudSourceOptions {}

export interface CSVPointCloudSourceConfig
    extends DatasetSourceConfigBase<'csv'>,
        PointCloudSourceOptions {}

export interface LASPointCloudSourceConfig
    extends DatasetSourceConfigBase<'las'>,
        PointCloudSourceOptions {}

export interface PointCloudDatasetConfig
    extends DatasetConfigBase<'flatPointcloud'>,
        DatasetConfigMaskingMixin {
    source: PointCloudSourceConfig;
}

export type PointCloudSourceConfig =
    | COPCPointCloudSourceConfig
    | CSVPointCloudSourceConfig
    | LASPointCloudSourceConfig;
