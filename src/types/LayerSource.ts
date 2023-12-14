import { type VectorStyle } from "./VectorStyle";

export type BasemapSourceLayerType = 'wms' | 'wmts';
export type OverlayVectorType = "geojson" | "kml" | "gpx";
export type OverlayVectorTileType = "mvt";
export type OverlayRasterType = "wms";
export type OverlayType = OverlayVectorType | OverlayVectorTileType | OverlayRasterType;
export type BasemapSourceLayerFormat = 'bil' | 'png' | 'jpg';

export interface LayerSource {
    type: BasemapSourceLayerType | OverlayType;
    nodata?: number;
}

export interface WMSSource extends LayerSource {
    type: 'wms';
    layer: string;
    url: string;
    format: BasemapSourceLayerFormat;
    projection: string;
}

export interface WMTSSource extends LayerSource {
    type: 'wmts';
    layer: string;
    url: string;
    format: BasemapSourceLayerFormat;
    projection: string;
}

export interface VectorSource extends LayerSource {
    type: OverlayVectorType;
    url: string;
    projection: string;
    style: VectorStyle;
}

export interface MVTSource extends LayerSource {
    type: OverlayVectorTileType;
    url: string;
    style: VectorStyle;
    backgroundColor: string;
}
