import type { Style } from 'ol/style';
import type { StyleFunction } from 'ol/style/Style';

/** Static vector style */
export interface StaticVectorStyle {
    /** Fill style (for polygons) */
    fill?: FillStyle;
    /** Stroke style (for lines and polygons) */
    stroke?: StrokeStyle;
    /** Point style (for points) */
    point?: PointStyle;
}

export type DynamicStyleId = string;

export type DynamicStyleCollection = Record<DynamicStyleId, Style | StyleFunction>;

/**
 * Vector style.
 *
 * Either an entry of the [Style configuration](../style.ts), or a static configuration
 */
export type VectorStyle = StaticVectorStyle | DynamicStyleId | 'default';

export interface FillStyle {
    color: string;
}

export interface StrokeStyle {
    color: string;
    width: number;
}

export interface PointStyle {
    radius: number;
    stroke: StrokeStyle;
    fill: FillStyle;
}
