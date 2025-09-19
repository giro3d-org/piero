import type { DataProjectionMixin, UrlOrDataMixin } from '@/giro3d/sources/mixins';

import type { DatasetConfigBase, DatasetConfigMaskingMixin } from './core';

/** CityJSON source configuration */
export interface CityJSONDatasetSourceConfig extends UrlOrDataMixin, DataProjectionMixin {}

/** CityJSON dataset configuration */
export interface CityJSONDatasetConfig
    extends DatasetConfigBase<'cityjson'>,
        DatasetConfigMaskingMixin {
    source: CityJSONDatasetSourceConfig;
}
