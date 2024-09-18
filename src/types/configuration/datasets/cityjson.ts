import type {
    SourceConfigProjectionMixin,
    SourceConfigUrlOrDataMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { DatasetSourceConfigBase, DatasetConfigWithSourceBase } from './core/baseConfig';

/** CityJSON source configuration */
export interface CityJSONDatasetSourceConfig
    extends DatasetSourceConfigBase<'cityjson'>,
        SourceConfigUrlOrDataMixin,
        SourceConfigProjectionMixin {}

/** CityJSON dataset configuration */
export interface CityJSONDatasetConfig
    extends DatasetConfigWithSourceBase<'cityjson', CityJSONDatasetSourceConfig> {}
