import type {
    DatasetSourceConfigDataProjection,
    DatasetSourceConfigUrlOrData,
    DatasetSourceConfigBase,
    DatasetConfigBaseWithSource,
} from './core/baseConfig';

export interface CityJSONDatasetSourceConfig
    extends DatasetSourceConfigBase<'cityjson'>,
        DatasetSourceConfigUrlOrData,
        DatasetSourceConfigDataProjection {}

export interface CityJSONDatasetConfig
    extends DatasetConfigBaseWithSource<'cityjson', CityJSONDatasetSourceConfig> {}
