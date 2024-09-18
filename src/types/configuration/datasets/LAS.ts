import type {
    DatasetSourceConfigUrlOrData,
    DatasetSourceConfigBase,
    DatasetSourceConfigDataProjection,
    DatasetConfigBaseWithSource,
} from './core/baseConfig';

export interface LASDatasetSourceConfig
    extends DatasetSourceConfigBase<'las'>,
        DatasetSourceConfigUrlOrData,
        DatasetSourceConfigDataProjection {}

export interface LASDatasetConfig
    extends DatasetConfigBaseWithSource<'las', LASDatasetSourceConfig> {}
