import type FeatureFormat from 'ol/format/Feature';
import { SourceConfigBase } from '../../sources/core/baseConfig';
import { VectorTileSourceConfig } from '../../sources/core/vectorTile';
import type { VectorStyle } from '@/types/VectorStyle';

/** VectorTile source with custom format */
export interface CustomVectorTileSourceConfig
    extends SourceConfigBase<'vector-tile'>,
        VectorTileSourceConfig {
    format: FeatureFormat;
    /** Style */
    style: VectorStyle;
}
