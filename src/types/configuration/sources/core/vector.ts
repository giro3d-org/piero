import type { VectorStyle } from '@/types/VectorStyle';
import type { CRS } from '@/types/configuration/geographic';
import type {
    ImageSourceConfigMixin,
    SourceConfigProjectionMixin,
    SourceConfigUrlOrDataMixin,
} from './baseConfig';

/** Mixin configuration for vector sources, common to meshes and map layers */
export interface VectorSourceConfigMixin extends SourceConfigProjectionMixin {
    /** @deprecated Use {@link dataProjection} instead, will be removed in 24.10 */
    projection?: CRS;
}

/** Mixin configuration for vector sources displayed as map layers */
export interface VectorAsLayerSourceConfigMixin
    extends VectorSourceConfigMixin,
        SourceConfigUrlOrDataMixin,
        ImageSourceConfigMixin {
    /** Style */
    style: VectorStyle;
}
