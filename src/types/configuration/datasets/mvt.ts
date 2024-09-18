import type { MVTSourceConfig } from '@/types/configuration/sources/mvt';
import type { DatasetAsLayerConfigMixin, DatasetConfigWithSourceBase } from './core/baseConfig';

/** MVT dataset configuration */
export interface MVTDatasetConfig
    extends DatasetConfigWithSourceBase<'mvt', MVTSourceConfig>,
        DatasetAsLayerConfigMixin {}
