import type {
    DatasetCascadingConfig,
    DatasetConfigBase,
    DatasetConfigMaskingMixin,
} from './core/baseConfig';
import type { BuildingsDatasetConfig } from './buildings';
import type { CityJSONDatasetConfig } from './cityjson';
import type { PointCloudDatasetConfig } from './pointCloud';
import type { BuildingDatasetConfig } from './ifc';
import type { PLYDatasetConfig } from './ply';
import type { PotreePointCloudDatasetConfig } from './potreePointCloud';
import type { TiledPointCloudDatasetConfig } from './tiledPointCloud';
import type { VectorMeshDatasetConfig, VectorShapeDatasetConfig } from './vectorMesh';
import type {
    ColorLayerDatasetConfig,
    ElevationLayerDatasetConfig,
    MaskLayerDatasetConfig,
} from './layer';

export type DatasetAsMeshConfig =
    | BuildingsDatasetConfig
    | CityJSONDatasetConfig
    | PointCloudDatasetConfig
    | BuildingDatasetConfig
    | PLYDatasetConfig
    | PotreePointCloudDatasetConfig
    | TiledPointCloudDatasetConfig
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

// Now let's define some utility types to help typing in the rest of the app:
// - which datasets needs a source
// - which datasets can be imported
// - which datasets can be displayed as Giro3D layers on the map

/** All datasets that have a source */
type DatasetConfigWithSource = Extract<DatasetConfig, { source: unknown }>;

/** All supported dataset source configuration */
export type DatasetSourceConfig = DatasetConfigWithSource['source'];

/** List of dataset types that can be imported into the app */
export type DatasetTypeImportable = DatasetConfigImportable['type'];

/** List of dataset sources that can be loaded as Giro3D layers */
export type DatasetAsLayerSourceConfig = DatasetAsLayerConfig['source'];
