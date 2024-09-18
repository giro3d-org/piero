import type { CustomVectorSourceConfig } from '@/types/configuration/sources/customVector';
import type { DatasetAsLayerConfigMixin, DatasetConfigWithSourceBase } from './core/baseConfig';

/** Vector with custom format dataset configuration */
export interface CustomVectorDatasetConfig
    extends DatasetConfigWithSourceBase<'vector', CustomVectorSourceConfig>,
        DatasetAsLayerConfigMixin {}
