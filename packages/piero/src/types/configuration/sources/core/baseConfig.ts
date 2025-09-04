import type { CRS, GeoVec3 } from '@/types/configuration/geographic';
import type { UrlOrData } from '@/utils/Fetcher';
import type { ImageSourceOptions } from '@giro3d/giro3d/sources/ImageSource';

/** Base configuration for all sources (layers, overlays and datasets) */
export interface SourceConfigBase<TSourceType extends string> {
    /** Type of source */
    type: TSourceType;
}

/** Mixin configuration for sources that require a URL */
export interface SourceConfigUrlMixin {
    /** URL of the source */
    url: string;
}

/** Mixin configuration for sources that require a URL or Blob */
export interface SourceConfigUrlOrDataMixin {
    /** URL of the source */
    url: UrlOrData;
}

/** Mixin configuration for sources that may set their geolocation */
export interface SourceConfigLocationMixin {
    /** Location */
    position?: GeoVec3;
}

/** Mixin configuration for sources that may have a data projection */
export interface SourceConfigProjectionMixin {
    /** CRS of the source - must be registered first */
    dataProjection?: CRS;
}

/** Mixin configuration for sources that may require elevation configuration */
export interface SourceConfigElevationMixin {
    /**
     * Elevation of data
     *
     * @defaultValue 0
     */
    elevation?: number;
    /**
     * Fetch elevation from provider
     *
     * @defaultValue false
     */
    fetchElevation?: boolean;
    /**
     * Fetch elevation from map instead of API
     *
     * @defaultValue false
     */
    fetchElevationFast?: boolean;
    /**
     * When fetching elevation, add this offset
     *
     * @defaultValue 0.1
     */
    fetchElevationOffset?: number;
    /**
     * When fetching or setting elevation, consider this value as no data
     *
     * @defaultValue 0
     */
    noDataValue?: number;
}

/** Mixin configuration for layers and overlays sources */
export interface ImageSourceConfigMixin
    extends Pick<
        ImageSourceOptions,
        // If adding options here, don't forget to update LayerBuilder.getSource for them to be taken into account
        'flipY' | 'is8bit' | 'colorSpace'
    > {
    /**
     * The relative resolution of the layer.
     * If greater than 1, the resolution will be greater, at the cost of performance and memory usage.
     * @defaultValue 1
     */
    resolution?: number;
}
