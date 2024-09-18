import type { GeoTIFFSourceOptions } from '@giro3d/giro3d/sources/GeoTIFFSource';

import type {
    ImageSourceConfig,
    SourceConfigBase,
} from '@/types/configuration/sources/core/baseConfig';
import type { CRS } from '@/types/configuration/geographic';
import { DatasetSourceConfigDataProjection } from '../datasets/core/baseConfig';

/** COG source configuration */
export interface GeoTIFFSourceConfig
    extends SourceConfigBase<'cog'>,
        ImageSourceConfig,
        DatasetSourceConfigDataProjection,
        Pick<GeoTIFFSourceOptions, 'url' | 'channels'> {
    /** @deprecated Use {@link dataProjection} instead, will be removed in 24.10 */
    projection: CRS;
}
