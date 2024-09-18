import type FeatureFormat from 'ol/format/Feature';
import { VectorSourceAsLayerConfig } from '../../sources/core/vector';
import { SourceConfigBase } from '../../sources/core/baseConfig';

/** Vector source with custom format */
export interface CustomVectorSourceConfig
    extends SourceConfigBase<'vector'>,
        VectorSourceAsLayerConfig {
    format: FeatureFormat;
}
