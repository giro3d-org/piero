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

export type ExperimentalFeatures = 'measurements';

interface Vec2 {
    x: number;
    y: number;
}

type GeoVec2 = Vec2 & { crs?: string };

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

type GeoVec3 = Vec3 & { crs?: string };

export type ColorRamp = string;

export type BasemapSourceLayerConfig = {
    type?: BasemapSourceLayerType;
    projection?: string;
    layer?: string;
    format?: string;
    url?: string;
    nodata?: number;
};

export type LayerConfig = {
    type: BaseLayerType;
    name: string;
    visible: boolean;
    source: BasemapSourceLayerConfig;
};

export type OnObjectPreloaded = (dataset: DatasetOrGroup, entity: Entity3D) => void;

/** Base configuration for datasets and groups */
export type DatasetBaseConfig<TType extends DatasetType | 'group'> = {
    /** Type of dataset */
    type: TType;
    /** Name of dataset */
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
    /**
     * Callback when the dataset or group is preloaded into the app.
     * Can be useful for transforming the preloaded 3D object.
     */
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
    children: DatasetOrGroupConfig[];
};

/** Configuration for dataset or group */
export type DatasetOrGroupConfig = DatasetConfig | DatagroupConfig;

export type OverlayBaseConfig = {
    type: OverlayType;
    name: string;
    visible: boolean;
};

export type OverlayVectorConfig = OverlayBaseConfig & {
    type: OverlayVectorType;
    style: VectorStyle;
    projection: string;
    url: string;
};

export type OverlayVectorTileConfig = OverlayBaseConfig & {
    type: OverlayVectorTileType;
    style: VectorStyle;
    backgroundColor: string;
    url: string;
};

export type OverlayRasterConfig = OverlayBaseConfig & {
    type: OverlayRasterType;
    source: BasemapSourceLayerConfig;
};

export type OverlayConfig = OverlayVectorConfig | OverlayVectorTileConfig | OverlayRasterConfig;

export type BookmarkConfig = {
    title: string;
    position: Vec3;
    target: Vec3;
    focalOffset: Vec3;
};

export type Configuration = {
    default_crs: string;
    enabled_features?: ExperimentalFeatures[];
    camera: {
        position: GeoVec2 | [number, number];
        altitude: number;
    };
    basemap: {
        center: GeoVec2 | [number, number];
        size: [number, number];
        colormap: {
            min: number;
            max: number;
            ramp: ColorRamp;
        };
        layers: LayerConfig[];
    };
    pointcloud: {
        min: number;
        max: number;
        ramp: ColorRamp;
    };
    analysis: {
        cross_section: {
            pivot: GeoVec2;
            orientation: number;
        };
        clipping_box: {
            center: GeoVec3;
            size: Vec3;
            floor_preset: {
                altitude: number;
                size: number;
                floor: number;
            };
        };
    };
    datasets: DatasetOrGroupConfig[];
    overlays: OverlayConfig[];
    bookmarks: BookmarkConfig[];
};
