import type { GeoExtent } from '@/types/configuration/geographic';
import type { TiledImageSourceOptions } from '@giro3d/giro3d/sources/TiledImageSource';
import type { ImageSourceConfigMixin } from './baseConfig';

/** Format for decoding the data */
export type DecodingFormat = 'Bil' | 'MapboxTerrain' | 'GeoTIFF';

/** Mixin configuration for tiled layers */
export interface TiledImageSourceConfigMixin
    extends ImageSourceConfigMixin,
        Pick<TiledImageSourceOptions, 'noDataValue' | 'httpTimeout' | 'retries'> {
    /** Mime-type (`image/png`, `image/jpg`, etc.) */
    format?: string;
    /** Decoding format. Required for Mapbox Terrain for instance. */
    imageFormat?: DecodingFormat;
    /** Restrict the extent of the data */
    extent?: GeoExtent; // FIXME: duplicate of LayerConfigBase.extent ?
    /**
     * No data value, if any
     * @deprecated Use `noDataValue` instead. Will be removed in v24.10
     */
    nodata?: number;
}
