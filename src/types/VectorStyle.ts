import type { DynamicStyleId } from '@/styles';

export interface StaticVectorStyle {
    fill?: FillStyle;
    stroke?: StrokeStyle;
    point?: PointStyle;
}

export type DynamicVectorStyle = DynamicStyleId;

export type VectorStyle = StaticVectorStyle | DynamicVectorStyle;

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
