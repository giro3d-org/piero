import Entity3D from '@giro3d/giro3d/entities/Entity3D';

import { type VectorStyle } from './VectorStyle';
import {
    type DatasetType,
    type DatasetTypeImportable,
    type DatasetTypeMultiple,
    type DatasetOrGroup,
} from './Dataset';
import { type BaseLayerType } from './BaseLayer';
import {
    type BasemapSourceLayerType,
    type OverlayRasterType,
    type OverlayType,
    type OverlayVectorTileType,
    type OverlayVectorType,
} from './LayerSource';

/**
 * CRS name.
 *
 * Requires the CRS to be registered in [`src/services/Giro3DManager.ts`](../services/Giro3DManager.ts)
 * @example `EPSG:2154`
 * @example `IGNF:WGS84G`
 */
export type CRS = string;

/** Available experimental features */
export type ExperimentalFeatures = 'measurements';

interface Vec2 {
    x: number;
    y: number;
}

/**
 * 2D Position
 *
 * If the CRS is not provided, we use `default_crs`
 *
 * @example `{ crs: 'EPSG:2154', x: 842022, y: 6516602 }`
 */
export type GeoVec2 = Vec2 & { crs?: CRS };

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

/**
 * 3D Position
 *
 * If the CRS is not provided, we use `default_crs`
 *
 * @example `{ crs: 'EPSG:2154', x: 842022, y: 6516602, z: 725 }`
 */
export type GeoVec3 = Vec3 & { crs?: CRS };

/**
 * Extent
 *
 * If the CRS is not provided, we use `default_crs`
 *
 * @example `{ crs: 'EPSG:2154', west: -111629.52, east: 1275028.84, south: 5976033.79, north: 7230161.64 }`
 */
export type GeoExtent = { crs?: string; west: number; east: number; south: number; north: number };

/**
 * Color ramp name, as supported by [chroma.js](https://gka.github.io/chroma.js/#chroma-brewer)
 */
export type ColorRamp = string;

/** Basemap layer source configuration */
export type BasemapSourceLayerConfig = {
    /** Type of source */
    type?: BasemapSourceLayerType;
    /** CRS of the source - must be registered first */
    projection?: CRS;
    /** Name of the layer, as available in the `getCapabilities` of the source */
    layer?: string;
    /**
     * File format
     *
     * @example `image/png`
     */
    format?: string;
    /**
     * URL of the source
     *
     * - For WMTS, source URL should be the URL pointing to the `getCapabilities`, e.g. `https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities`,
     * - For WMS should be the endpoint without parameters, e.g. `'https://data.geopf.fr/wms-r'`
     */
    url?: string;
    /** No data value, if any */
    nodata?: number;
};

/** Basemap layer configuration */
export type LayerConfig = {
    /** Type of layer */
    type: BaseLayerType;
    /** Name of the layer displayed in the UI */
    name: string;
    /** Indicates if the layer should be loaded by default */
    visible: boolean;
    /** Source configuration */
    source: BasemapSourceLayerConfig;
};

/**
 * Callback which is called when the dataset is preloaded into the app.
 *
 * This can be useful for post-processing your data (transformation, rotation, etc.).
 *
 * @param dataset Dataset created
 * @param entity Giro3D entity created
 */
export type OnObjectPreloaded = (dataset: DatasetOrGroup, entity: Entity3D) => void;

/** Base configuration for datasets and groups */
export type DatasetBaseConfig<TType extends DatasetType | 'group'> = {
    /** Type of dataset */
    type: TType;
    /** Name of dataset displayed in the UI */
    name: string;
    /**
     * Default visibility of the dataset.
     * When set on a group, will be inherited to all descendants.
     *
     * @default false
     */
    visible?: boolean;
    /**
     * Default opacity of the dataset.
     * When set on a group, will be inherited to all descendants.
     *
     * @default 1
     */
    opacity?: number;

    /**
     * Position of the dataset.
     * Required for PLY datasets. Optional for IFC datasets. Ignored for all other datasets.
     * When set on a group, will be inherited to all descendants.
     */
    position?: GeoVec3;
    /**
     * Elevation of the dataset.
     * Optional for SHP, GeoJSON, Geopackage datasets. Ignored for all other datasets.
     * When set on a group, will be inherited to all descendants.
     */
    elevation?: number;
    /**
     * Whether this dataset can mask the basemap (enables the "mask" button for this dataset).
     * This can help against Z-fighting when your dataset is on the ground and the map's elevation layer is not precise-enough.
     * When set on a group, will be inherited to all descendants.
     *
     * @default false
     */
    canMaskBasemap?: boolean;
    /**
     * Whether this dataset masks the basemap by default (can still be disabled via the "mask" button)
     * When set on a group, will be inherited to all descendants.
     *
     * @default false
     */
    isMaskingBasemap?: boolean;
    /** Callback when the dataset or group is preloaded into the app. */
    onObjectPreloaded?: OnObjectPreloaded;
};

/** Configuration for imported datasets */
export type DatasetImportedBaseConfig<TType extends DatasetType> = DatasetBaseConfig<TType> & {
    url: null;
};

/** Configuration for datasets that require a URL */
export type DatasetRemoteBaseConfig<TType extends DatasetType> = DatasetBaseConfig<TType> & {
    url: string;
};

/** Configuration for datasets that support multiple URLs */
export type DatasetMultipleRemoteBaseConfig<TType extends DatasetType> =
    DatasetBaseConfig<TType> & {
        url: string[];
    };

/** Configuration for datasets */
export type DatasetConfig =
    | DatasetRemoteBaseConfig<DatasetType>
    | DatasetMultipleRemoteBaseConfig<DatasetTypeMultiple>;
/** Configuration for imported datasets */
export type DatasetImportedConfig = DatasetImportedBaseConfig<DatasetTypeImportable>;

/** Configuration for group */
export type DatagroupConfig = DatasetBaseConfig<'group'> & {
    /** Datasets contained in this group */
    children: DatasetOrGroupConfig[];
};

/** Configuration for dataset or group */
export type DatasetOrGroupConfig = DatasetConfig | DatagroupConfig;

/** Overlay base configuration */
export type OverlayBaseConfig = {
    /** Type of data  */
    type: OverlayType;
    /** Name of the overlay displayed in the UI */
    name: string;
    /** Default visibility of the overlay */
    visible: boolean;
};

/** Vector data overlay configuration */
export type OverlayVectorConfig = OverlayBaseConfig & {
    type: OverlayVectorType;
    /** Style */
    style: VectorStyle;
    /** CRS of the data - must be registered first */
    projection: CRS;
    /** URL of the source */
    url: string;
};

/** Tiled vector data overlay configuration */
export type OverlayVectorTileConfig = OverlayBaseConfig & {
    type: OverlayVectorTileType;
    /** Style */
    style: VectorStyle;
    /** Background-color - empty for transparent */
    backgroundColor: string;
    /**
     * URL of the source
     *
     * - For MVT, should include `{x},{y},{z}` components, e.g. `https://3d.oslandia.com/mysource/{z}/{x}/{y}.pbf`
     */
    url: string;
};

/** Raster data overlay configuration */
export type OverlayRasterConfig = OverlayBaseConfig & {
    type: OverlayRasterType;
    /** Source configuration */
    source: BasemapSourceLayerConfig;
};

/** Overlay configuration */
export type OverlayConfig = OverlayVectorConfig | OverlayVectorTileConfig | OverlayRasterConfig;

/**
 * Bookmark configuration.
 *
 * The easiest way to define a bookmark is actually to set it in the app, export it and copy the values from the JSON file.
 */
export type BookmarkConfig = {
    /** Name of the bookmark displayed in the UI */
    title: string;
    /** 3D position of the camera, in `default_crs` */
    position: Vec3;
    /** 3D position of the camera target, in `default_crs` */
    target: Vec3;
    /** Focal offset of the camera */
    focalOffset: Vec3;
};

/**
 * Deprecated camera configuration
 *
 * @deprecated
 */
export type CameraConfigDeprecated = {
    /** Initial camera position */
    position: GeoVec2 | [number, number];
    /** Initial camera altitude */
    altitude: number;
};
/** Camera configuration */
export type CameraConfig = {
    /** Initial camera position */
    position: GeoVec3;
    /** Initial camera target - if not provided, will use the center of the extent */
    lookAt?: GeoVec3;
};

/** Extent configuration */
export type ExtentConfig =
    | {
          extent: GeoExtent;
      }
    | {
          center: GeoVec2 | [number, number];
          size: [number, number];
      };

/** Basemap configuration */
export type BasemapConfig = ExtentConfig & {
    /**
     * Color map configuration for Elevation layer, used when it's the only layer displayed
     */
    colormap: {
        min: number;
        max: number;
        ramp: ColorRamp;
    };
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
};

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
    pointcloud: {
        /** Altitude for the start of the color ramp */
        min: number;
        /** Altitude for the end of the color ramp */
        max: number;
        /** Color ramp */
        ramp: ColorRamp;
    };
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
    overlays: OverlayConfig[];
    /** Array of bookmarks - can be empty */
    bookmarks: BookmarkConfig[];
};
