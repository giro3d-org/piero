import type { DatasetCascadingConfig, DatasetConfigBase, DatasetConfigMaskingMixin } from './core';
import type { FeatureCollectionDatasetConfig } from './featureCollection';
import type { CityJSONDatasetConfig } from './cityjson';
import type { PointCloudDatasetConfig } from './pointCloud';
import type { BuildingDatasetConfig } from './ifc';
import type { PLYDatasetConfig } from './ply';
import type { PotreePointCloudDatasetConfig } from './potreePointCloud';
import type { TiledPointCloudDatasetConfig } from './tiledPointCloud';
import type {
    VectorLabelsDatasetConfig,
    VectorMeshDatasetConfig,
    VectorShapeDatasetConfig,
} from './vector';
import type {
    ColorLayerDatasetConfig,
    ElevationLayerDatasetConfig,
    MaskLayerDatasetConfig,
} from './layer';

export type DatasetAsMeshConfig =
    | CityJSONDatasetConfig
    | PointCloudDatasetConfig
    | FeatureCollectionDatasetConfig
    | PLYDatasetConfig
    | PointCloudDatasetConfig
    | PotreePointCloudDatasetConfig
    | TiledPointCloudDatasetConfig
    | VectorLabelsDatasetConfig
    | VectorMeshDatasetConfig
    | VectorShapeDatasetConfig;

export type DatasetAsLayerConfig =
    | ColorLayerDatasetConfig
    | ElevationLayerDatasetConfig
    | MaskLayerDatasetConfig;

/** All supported datasets */
export type DatasetConfig = DatasetAsMeshConfig | DatasetAsLayerConfig;

export type DatasetConfigImportable = Extract<
    DatasetConfig,
    | CityJSONDatasetConfig
    | PointCloudDatasetConfig
    | BuildingDatasetConfig
    | VectorMeshDatasetConfig
    | VectorShapeDatasetConfig
    | VectorLabelsDatasetConfig
    | ColorLayerDatasetConfig
>;

/** List of all dataset types */
export type DatasetType = DatasetConfig['type'];

/** Configuration for a group of datasets */
export interface DatagroupConfig
    extends DatasetConfigBase<'group'>,
        DatasetCascadingConfig,
        DatasetConfigMaskingMixin {
    /** Datasets contained in this group */
    children: DatasetOrGroupConfig[];
}
/** Configuration for dataset hierarchy */
export type DatasetOrGroupConfig = DatasetConfig | DatagroupConfig;

/** List of dataset types that can be imported into the app */
export type DatasetTypeImportable = DatasetConfigImportable['type'];
