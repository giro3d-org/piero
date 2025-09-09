import type { SourceConfigBase } from '@/types/configuration/sources/core/baseConfig';
import type { VectorAsLayerSourceConfigMixin } from '@/types/configuration/sources/core/vector';
import type FeatureFormat from 'ol/format/Feature';

/** Vector source with custom format */
export interface CustomVectorSourceConfig
    extends SourceConfigBase<'vector'>,
        VectorAsLayerSourceConfigMixin {
    format: FeatureFormat;
}
