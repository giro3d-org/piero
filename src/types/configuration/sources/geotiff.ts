import type { CRS } from '@/types/configuration/geographic';
import type { GeoTIFFSourceOptions } from '@giro3d/giro3d/sources/GeoTIFFSource';
import type {
    ImageSourceConfigMixin,
    SourceConfigBase,
    SourceConfigProjectionMixin,
} from './core/baseConfig';

/** COG source configuration */
export interface GeoTIFFSourceConfig
    extends SourceConfigBase<'cog'>,
        ImageSourceConfigMixin,
        SourceConfigProjectionMixin,
        Pick<GeoTIFFSourceOptions, 'url' | 'channels'> {
    /** @deprecated Use {@link dataProjection} instead, will be removed in 24.10 */
    projection: CRS;
}
