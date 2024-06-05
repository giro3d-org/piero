import type { TiledImageSourceOptions } from '@giro3d/giro3d/sources/TiledImageSource';

import type { GeoExtent } from '@/types/configuration/geographic';
import type { SourceConfigBase } from '@/types/configuration/layers/core/baseConfig';

export type DecodingFormat = 'Bil' | 'MapboxTerrain' | 'GeoTIFF';

/** Base configuration for tiled layers */
export interface TiledImageSourceBaseConfig<TType extends string>
    extends Pick<TiledImageSourceOptions, 'noDataValue' | 'httpTimeout' | 'retries'>,
        SourceConfigBase<TType> {
    /** Mime-type (`image/png`, `image/jpg`, etc.) */
    format?: string;
    /** Decoding format. Required for Mapbox Terrain for instance. */
    imageFormat?: DecodingFormat;
    extent?: GeoExtent;
    /**
     * No data value, if any
     * @deprecated Use `noDataValue` instead. Will be removed in v24.10
     */
    nodata?: number;
}
