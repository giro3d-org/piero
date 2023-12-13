import { VectorStyle } from "./VectorStyle";

interface Vec2 {
    x: number;
    y: number;
}

type GeoVec2 = Vec2 & { crs: string };

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

type GeoVec3 = Vec3 & { crs: string };

export type ColorRamp = string;

export type LayerType = "elevation" | "color";
export type BasemapSourceLayerType = 'wms' | 'wmts';
export type DatasetType = "ifc" | "ply" | "cityjson" | "pointcloud" | "bdtopo";

export type OverlayVectorType = "geojson" | "kml" | "gpx";
export type OverlayVectorTileType = "mvt";
export type OverlayRasterType = "wms";
export type OverlayType = OverlayVectorType | OverlayVectorTileType | OverlayRasterType;

export type BasemapSourceLayerConfig = {
    type?: BasemapSourceLayerType,
    projection?: string;
    layer?: string;
    format?: string;
    url?: string;
    nodata?: number;
};

export type LayerConfig = {
    type: LayerType,
    name: string,
    visible: boolean,
    source: BasemapSourceLayerConfig,
};

export type DatasetBaseConfig = {
    type: DatasetType,
    url: string;
    name: string;
    position?: GeoVec3,
    /** Whether this dataset can mask the basemap (enables the "mask" button for this dataset) */
    canMaskBasemap?: boolean,
    /** Whether this dataset masks the basemap by default (can still be disabled via the "mask" button) */
    isMaskingBasemap?: boolean,
};

export type DatasetPlyConfig = DatasetBaseConfig & {
    type: 'ply',
    position: GeoVec3,
};

export type DatasetConfig = DatasetBaseConfig | DatasetPlyConfig;

export type OverlayBaseConfig = {
    type: OverlayType,
    name: string,
    visible: boolean;
};

export type OverlayVectorConfig = OverlayBaseConfig & {
    type: OverlayVectorType,
    style: VectorStyle;
    projection: string;
    url: string;
};

export type OverlayVectorTileConfig = OverlayBaseConfig & {
    type: OverlayVectorTileType,
    style: VectorStyle;
    backgroundColor: string;
    url: string;
}

export type OverlayRasterConfig = OverlayBaseConfig & {
    type: OverlayRasterType;
    source: BasemapSourceLayerConfig;
}

export type OverlayConfig = OverlayVectorConfig | OverlayVectorTileConfig | OverlayRasterConfig;

export type BookmarkConfig = {
    title: string;
    position: Vec3;
    target: Vec3;
    focalOffset: Vec3;
}

export type Configuration = {
    default_crs: string,
    camera: {
        position: [number, number],
        altitude: number,
    },
    basemap: {
        center: [number, number],
        size: [number, number],
        colormap: {
            min: number,
            max: number,
            ramp: ColorRamp,
        },
        layers: LayerConfig[],
    },
    pointcloud: {
        min: number,
        max: number,
        ramp: ColorRamp,
    },
    analysis: {
        cross_section: {
            pivot: GeoVec2,
            orientation: number,
        },
        clipping_box: {
            center: GeoVec3,
            size: Vec3,
            floor_preset: {
                altitude: number,
                size: number,
                floor: number,
            }
        }
    },
    datasets: DatasetConfig[],
    overlays: OverlayConfig[],
    bookmarks: BookmarkConfig[],
}
