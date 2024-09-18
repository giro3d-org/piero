import type {
    DatasetConfigBase,
    DatasetConfigWithDataProjection,
    DatasetConfigWithSingleUrlOrData,
} from './core/baseConfig';

export interface CityJSONDatasetConfig
    extends DatasetConfigBase<'cityjson'>,
        DatasetConfigWithSingleUrlOrData,
        DatasetConfigWithDataProjection {}
