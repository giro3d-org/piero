import type {
    SourceConfigProjectionMixin,
    SourceConfigUrlOrDataMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigWithSourceBase, DatasetSourceConfigBase } from './core/baseConfig';

/** LAS source configuration */
export interface LASDatasetSourceConfig
    extends DatasetSourceConfigBase<'las'>,
        SourceConfigUrlOrDataMixin,
        SourceConfigProjectionMixin {}

/** LAS dataset configuration */
export interface LASDatasetConfig
    extends DatasetConfigWithSourceBase<'las', LASDatasetSourceConfig> {}
