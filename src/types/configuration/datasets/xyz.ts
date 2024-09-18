import type { XYZSourceConfig } from '@/types/configuration/sources/xyz';
import type { DatasetAsLayerConfigMixin, DatasetConfigWithSourceBase } from './core/baseConfig';

/** XYZ dataset configuration */
export interface XYZDatasetConfig
    extends DatasetConfigWithSourceBase<'xyz', XYZSourceConfig>,
        DatasetAsLayerConfigMixin {}
