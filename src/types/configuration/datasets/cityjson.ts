import type { CityJSONSource } from '@/giro3d/entities/CityJSONEntity';
import type { DatasetConfigBase, DatasetConfigMaskingMixin } from './core';

/** CityJSON source configuration */
export interface CityJSONDatasetSourceConfig extends Omit<CityJSONSource, 'featureProjection'> {}

/** CityJSON dataset configuration */
export interface CityJSONDatasetConfig
    extends DatasetConfigBase<'cityjson'>,
        DatasetConfigMaskingMixin {
    source: CityJSONDatasetSourceConfig;
}
