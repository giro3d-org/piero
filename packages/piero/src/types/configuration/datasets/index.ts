import type { CityJSONDatasetConfig } from './cityjson';
import type { DatasetCascadingConfig, DatasetConfigBase, DatasetConfigMaskingMixin } from './core';
import type { FeatureCollectionDatasetConfig } from './featureCollection';
import type { IFCDatasetConfig } from './ifc';
import type {
    ColorLayerDatasetConfig,
    ElevationLayerDatasetConfig,
    MaskLayerDatasetConfig,
} from './layer';
import type { PLYDatasetConfig } from './ply';
import type { PointCloudDatasetConfig } from './pointCloud';
import type { PotreePointCloudDatasetConfig } from './potreePointCloud';
import type { TiledGeomDatasetConfig } from './tiledGeom';
import type { TiledIfcDatasetConfig } from './tiledIfc';
import type { TiledPointCloudDatasetConfig } from './tiledPointCloud';
import type {
    VectorLabelsDatasetConfig,
    VectorMeshDatasetConfig,
    VectorShapeDatasetConfig,
} from './vector';

/** Configuration for a group of datasets */
export interface DatagroupConfig
    extends DatasetCascadingConfig,
        DatasetConfigBase<'group'>,
        DatasetConfigMaskingMixin {
    /** Datasets contained in this group */
    children: DatasetOrGroupConfig[];
}

export type DatasetAsLayerConfig =
    | ColorLayerDatasetConfig
    | ElevationLayerDatasetConfig
    | MaskLayerDatasetConfig;

export type DatasetAsMeshConfig =
    | CityJSONDatasetConfig
    | FeatureCollectionDatasetConfig
    | IFCDatasetConfig
    | PLYDatasetConfig
    | PointCloudDatasetConfig
    | PotreePointCloudDatasetConfig
    | TiledGeomDatasetConfig
    | TiledIfcDatasetConfig
    | TiledPointCloudDatasetConfig
    | VectorLabelsDatasetConfig
    | VectorMeshDatasetConfig
    | VectorShapeDatasetConfig;

/** All supported datasets */
export type DatasetConfig = DatasetAsLayerConfig | DatasetAsMeshConfig;

export type DatasetConfigImportable = Extract<
    DatasetConfig,
    | CityJSONDatasetConfig
    | ColorLayerDatasetConfig
    | IFCDatasetConfig
    | PointCloudDatasetConfig
    | VectorLabelsDatasetConfig
    | VectorMeshDatasetConfig
    | VectorShapeDatasetConfig
>;

/** Configuration for dataset hierarchy */
export type DatasetOrGroupConfig = DatagroupConfig | DatasetConfig;
/** List of all dataset types */
export type DatasetType = DatasetConfig['type'];

/** List of dataset types that can be imported into the app */
export type DatasetTypeImportable = DatasetConfigImportable['type'];
