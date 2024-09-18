import type { TiledImageSourceOptions } from '@giro3d/giro3d/sources/TiledImageSource';

import type { GeoExtent } from '@/types/configuration/geographic';
import type { ImageSourceConfig } from '@/types/configuration/sources/core/baseConfig';

export type DecodingFormat = 'Bil' | 'MapboxTerrain' | 'GeoTIFF';

/** Base configuration for tiled layers */
export interface TiledImageSourceConfig
    extends ImageSourceConfig,
        Pick<TiledImageSourceOptions, 'noDataValue' | 'httpTimeout' | 'retries'> {
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
