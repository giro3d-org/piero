import type { MapConstructorOptions } from '@giro3d/giro3d/entities/Map';
import type { CRS, GeoExtent, GeoVec2, GeoVec3, Vec3 } from './configuration/geographic';
import type { ExperimentalFeatures } from './configuration/features';
import type { ColorMapConfig } from './configuration/color';
import type {
    LayerConfig,
    OverlayConfig,
    OverlayRasterConfigDeprecated,
    OverlayVectorConfigDeprecated,
    OverlayVectorTileConfigDeprecated,
} from './configuration/layers';
import type { DatasetOrGroupConfig } from './configuration/dataset';
import type { BookmarkConfig } from './configuration/bookmark';
import type { CameraConfig, CameraConfigDeprecated } from './configuration/camera';

/**
 * Extent configuration
 *
 * @deprecated Use {@link BasemapConfig.extent} field instead. Will be removed in release v24.10.
 */
export interface ExtentConfigWithCenter {
    /**
     * Center of the map.
     *
     * @deprecated Use {@link BasemapConfig.extent} field instead. Will be removed in release v24.10.
     */
    center?: GeoVec2 | [number, number];
    /**
     * Size of the map in CRS units.
     *
     * @deprecated Use {@link BasemapConfig.extent} field instead. Will be removed in release v24.10.
     */
    size?: [number, number];
}

/** Basemap configuration */
export interface BasemapConfig
    extends ExtentConfigWithCenter,
        Pick<
            MapConstructorOptions,
            | 'hillshading'
            | 'contourLines'
            | 'graticule'
            | 'colorimetry'
            | 'doubleSided'
            | 'terrain'
            | 'backgroundColor'
            | 'backgroundOpacity'
            | 'showOutline'
            | 'elevationRange'
        > {
    /** Extent configuration */
    extent?: GeoExtent;

    /**
     * Color map configuration for Elevation layer, used when it's the only layer displayed
     */
    colormap: ColorMapConfig;

    /**
     * Layers
     *
     * Layers define how the 3D map is displayed:
     * - The elevation layer defines how the map is rendered in 3D,
     * - Color layers define how the map appears, they are typically imagery or plan.
     *
     * There should be exactly one elevation layer and one or several color layers.
     */
    layers: LayerConfig[];
}

/** Piero configuration */
export type Configuration = {
    /**
     * The default CRS to be used in the view
     *
     * Requires the CRS to be geocentric.
     * Requires the CRS to be registered.
     */
    default_crs: CRS;
    /** Experimental features to switch on */
    enabled_features?: ExperimentalFeatures[];
    /** Camera configuration */
    camera: CameraConfig | CameraConfigDeprecated;
    /** Basemap configuration */
    basemap: BasemapConfig;
    /** Pointcloud display configuration */
    pointcloud: ColorMapConfig;
    /** Analysis tools configuration */
    analysis: {
        /** Cross section configuration */
        cross_section: {
            /** Default pivot point */
            pivot: GeoVec2;
            /** Default orientation in degrees of the cross section plane */
            orientation: number;
        };
        /** Clipping box configuration */
        clipping_box: {
            /** Default center of the clipping box */
            center: GeoVec3;
            /** Default size of the clipping box */
            size: Vec3;
            /** Default settings for floor presets */
            floor_preset: {
                /** Altitude of the ground of floor 0 */
                altitude: number;
                /** Height of a floor */
                size: number;
                /** Default floor number */
                floor: number;
            };
        };
    };
    /**
     * Array of datasets to display
     *
     * Datasets define the 3D data displayed in the app.
     *
     * Datasets can be organized in groups; some parameters are then inherited to their children.
     *
     * Some dataset types support loading multiple URLs into one dataset. For these types, you can set an array of URLs for the `url` field.
     */
    datasets: DatasetOrGroupConfig[];
    /**
     * Array of overlays to display on the 2.5D map - can be empty
     *
     * Overlays define data that are merged into the 2.5D map.
     * These are typically vector data or rasters with transparent backgrounds.
     */
    overlays: (
        | OverlayConfig
        | OverlayVectorConfigDeprecated
        | OverlayVectorTileConfigDeprecated
        | OverlayRasterConfigDeprecated
    )[];
    /** Array of bookmarks - can be empty */
    bookmarks: BookmarkConfig[];
};
