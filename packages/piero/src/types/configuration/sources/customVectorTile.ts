import type { SourceConfigBase } from '@/types/configuration/sources/core/baseConfig';
import type { VectorTileSourceConfigMixin } from '@/types/configuration/sources/core/vectorTile';
import type FeatureFormat from 'ol/format/Feature';
import type RenderFeature from 'ol/render/Feature';

/** VectorTile source with custom format */
export interface CustomVectorTileSourceConfig
    extends SourceConfigBase<'vector-tile'>,
        VectorTileSourceConfigMixin {
    format: FeatureFormat<typeof RenderFeature>;
}
