import type { WMSSourceConfig } from '@/types/configuration/sources/wms';
import type { DatasetAsLayerConfigMixin, DatasetConfigWithSourceBase } from './core/baseConfig';

/** WMS dataset configuration */
export interface WMSDatasetConfig
    extends DatasetConfigWithSourceBase<'wms', WMSSourceConfig>,
        DatasetAsLayerConfigMixin {}
