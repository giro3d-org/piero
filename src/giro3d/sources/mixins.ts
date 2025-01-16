import type { UrlOrData } from '@/utils/Fetcher';
import type Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

/** Mixin configuration for sources that require a URL */
export interface UrlMixin {
    /** URL of the source */
    url: string;
}

/** Mixin configuration for sources that require a URL or Blob */
export interface UrlOrDataMixin {
    /** URL of the source */
    url: UrlOrData;
}

/** Mixin configuration for sources that may have a data projection */
export interface DataProjectionMixin {
    /** CRS of the source */
    dataProjection?: string;
}

/** Mixin configuration for sources that may have a feature projection */
export interface FeatureProjectionMixin {
    /** CRS of the target, should be the instance's CRS */
    featureProjection?: string;
}

/** Mixin configuration for sources that may set their geolocation */
export interface CoordinatesMixin {
    /** Location, should be in the instance's CRS */
    at?: Coordinates;
}

/** Mixin configuration for sources that may require elevation configuration */
export interface ElevationMixin {
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
