import type { DatasetConfigBase } from './core/baseConfig';
import { CityJSONSource } from '@/giro3d/entities/CityJSONEntity';

/** CityJSON source configuration */
export interface CityJSONDatasetSourceConfig extends Omit<CityJSONSource, 'featureProjection'> {}

/** CityJSON dataset configuration */
export interface CityJSONDatasetConfig extends DatasetConfigBase<'cityjson'> {
    source: CityJSONDatasetSourceConfig;
}
