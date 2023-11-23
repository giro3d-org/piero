export interface VectorStyle {
    fill?: FillStyle;
    stroke?: StrokStyle;
    point?: PointStyle;
}

export interface FillStyle {
    color: string;
}

export interface StrokStyle {
    color: string;
    width: number;
}

export interface PointStyle {
    radius: number;
    stroke: StrokStyle;
    fill: FillStyle;
}