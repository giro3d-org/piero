import { VectorStyle } from "./VectorStyle";

export interface LayerSource {
    type: 'wms' | 'wmts' | 'geojson' | 'kml' | 'mvt'; // TODO complete
    nodata: number;
}

export interface WMSSource extends LayerSource {
    layer: string;
    url: string;
    format: 'bil' | 'png' | 'jpg';
    projection: string;
}

export interface WMTSSource extends LayerSource {
    layer: string;
    url: string;
    format: 'bil' | 'png' | 'jpg';
    projection: string;
}

export interface VectorSource extends LayerSource {
    url: string;
    projection: string;
    style: VectorStyle;
}

export interface MVTSource extends LayerSource {
    url: string;
    style: VectorStyle;
    backgroundColor: string;
}