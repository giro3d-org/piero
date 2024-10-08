import type { DynamicStyleId } from '@/styles';

/** Static vector style */
export interface StaticVectorStyle {
    /** Fill style (for polygons) */
    fill?: FillStyle;
    /** Stroke style (for lines and polygons) */
    stroke?: StrokeStyle;
    /** Point style (for points) */
    point?: PointStyle;
}

/* Dynamic vector style */
export type DynamicVectorStyle = DynamicStyleId;

/**
 * Vector style.
 *
 * Either an entry of the [Style configuration](../style.ts), or a static configuration
 */
export type VectorStyle = StaticVectorStyle | DynamicVectorStyle | 'default';

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
