import type { TiledImageSourceOptions } from '@giro3d/giro3d/sources/TiledImageSource';

import type { GeoExtent } from '@/types/configuration/geographic';
import type { SourceConfigBase } from '@/types/configuration/layers/core/baseConfig';

/** Base configuration for tiled layers */
export interface TiledImageSourceBaseConfig<TType extends string>
    extends Pick<TiledImageSourceOptions, 'noDataValue'>,
        SourceConfigBase<TType> {
    format?: string;
    extent?: GeoExtent;
    /**
     * No data value, if any
     * @deprecated Use `noDataValue` instead. Will be removed in v24.10
     */
    nodata?: number;
}
