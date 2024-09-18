import type { GeoTIFFSourceConfig } from '@/types/configuration/sources/geotiff';
import type { DatasetAsLayerConfigMixin, DatasetConfigWithSourceBase } from './core/baseConfig';

/** COG dataset configuration */
export interface GeoTIFFDatasetConfig
    extends DatasetConfigWithSourceBase<'cog', GeoTIFFSourceConfig>,
        DatasetAsLayerConfigMixin {}
