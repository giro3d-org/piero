import type { WMTSSourceConfig } from '@/types/configuration/sources/wmts';
import type { DatasetAsLayerConfigMixin, DatasetConfigWithSourceBase } from './core/baseConfig';

/** WMTS dataset configuration */
export interface WMTSDatasetConfig
    extends DatasetConfigWithSourceBase<'wmts', WMTSSourceConfig>,
        DatasetAsLayerConfigMixin {}
