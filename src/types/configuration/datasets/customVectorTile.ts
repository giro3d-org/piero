import type { CustomVectorTileSourceConfig } from '@/types/configuration/sources/customVectorTile';
import type { DatasetAsLayerConfigMixin, DatasetConfigWithSourceBase } from './core/baseConfig';

/** VectorTile with custom format dataset configuration */
export interface CustomVectorTileDatasetConfig
    extends DatasetConfigWithSourceBase<'vector-tile', CustomVectorTileSourceConfig>,
        DatasetAsLayerConfigMixin {}
