import type { Style } from 'ol/style';
import type { StyleFunction } from 'ol/style/Style';

export type DynamicStyleCollection = Record<DynamicStyleId, Style | StyleFunction>;

export type DynamicStyleId = string;

export interface FillStyle {
    color: string;
}

export interface PointStyle {
    fill: FillStyle;
    radius: number;
    stroke: StrokeStyle;
}

/** Static vector style */
export interface StaticVectorStyle {
    /** Fill style (for polygons) */
    fill?: FillStyle;
    /** Point style (for points) */
    point?: PointStyle;
    /** Stroke style (for lines and polygons) */
    stroke?: StrokeStyle;
}

export interface StrokeStyle {
    color: string;
    width: number;
}

/**
 * Vector style.
 *
 * Either an entry of the [Style configuration](../style.ts), or a static configuration
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type VectorStyle = 'default' | DynamicStyleId | StaticVectorStyle;
