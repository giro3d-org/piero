import type { MapConstructorOptions } from '@giro3d/giro3d/entities/Map';

import type { AnalysisConfig } from '@/types/configuration/analysis';
import type { BookmarkConfig } from '@/types/configuration/bookmark';
import type { CameraConfig, CameraConfigDeprecated } from '@/types/configuration/camera';
import type { ColorMapConfig } from '@/types/configuration/color';
import type { ExperimentalFeatures } from '@/types/configuration/features';
import type { CRS, GeoExtent, GeoVec2 } from '@/types/configuration/geographic';
import type {
    LayerConfig,
    OverlayConfig,
    OverlayRasterConfigDeprecated,
    OverlayVectorConfigDeprecated,
    OverlayVectorTileConfigDeprecated,
} from '@/types/configuration/layers';

import type { DatasetOrGroupConfig } from './configuration/datasets';
import type { VectorDatasetRendering } from './configuration/datasets/vector';

// For configuration, please use interfaces instead of types, it enables inheritance in the API documentation.
// Also, please prefer JSON-serializable fields, so that one day if we want to fetch the configuration from
// a back-end, we won't have too much rework to do.

/** Basemap configuration */
export interface BasemapConfig
    extends ExtentConfigWithCenter,
        Pick<
            MapConstructorOptions,
            | 'backgroundColor'
            | 'backgroundOpacity'
            | 'colorimetry'
            | 'contourLines'
            | 'elevationRange'
            | 'graticule'
            | 'lighting'
            | 'showOutline'
            | 'side'
            | 'terrain'
        > {
    /**
     * Color map configuration for Elevation layer, used when it's the only layer displayed
     */
    colormap: ColorMapConfig;

    /** Extent configuration */
    extent?: GeoExtent;

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
export interface Configuration {
    /** Analysis tools configuration */
    analysis: AnalysisConfig;
    /** Basemap configuration */
    basemap: BasemapConfig;
    /** Array of bookmarks - can be empty */
    bookmarks: BookmarkConfig[];
    /** Camera configuration */
    camera: CameraConfig | CameraConfigDeprecated;
    /** Custom CRS definitions */
    crs_definitions?: Record<CRS, string>;
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
     * The default CRS to be used in the view
     *
     * Requires the CRS to be geocentric.
     * Requires the CRS to be registered.
     */
    default_crs: CRS;
    /** Experimental features to switch on */
    enabled_features?: ExperimentalFeatures[];
    /**
     * When importing vector datasets as meshes, select if the app should fetch elevation.
     * @defaultValue true
     */
    importedMeshDatasetFetchElevation?: boolean;
    /**
     * When importing vector datasets as meshes, select how to fetch elevation.
     * By default (true), it will query the default Alticoder service (ie. IGN).
     * We recommend turning it on in case of large datasets (querying would be slow) or if outside France (won't work)
     * @defaultValue false
     */
    importedMeshDatasetFetchElevationFast?: boolean;
    /**
     * When importing vector datasets, pick how to render them.
     * @defaultValue mesh
     */
    importedVectorDatasetRendering?: 'overlay' | VectorDatasetRendering;
    /**
     * Array of overlays to display on the 2.5D map - can be empty
     *
     * Overlays define data that are merged into the 2.5D map.
     * These are typically vector data or rasters with transparent backgrounds.
     */
    overlays: (
        | OverlayConfig
        | OverlayRasterConfigDeprecated
        | OverlayVectorConfigDeprecated
        | OverlayVectorTileConfigDeprecated
    )[];
    /** Pointcloud display configuration */
    pointcloud: ColorMapConfig;
}

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
    center?: [number, number] | GeoVec2;
    /**
     * Size of the map in CRS units.
     *
     * @deprecated Use {@link BasemapConfig.extent} field instead. Will be removed in release v24.10.
     */
    size?: [number, number];
}
