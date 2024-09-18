import type {
    DatasetCascadingConfig,
    DatasetConfigBase,
    DatasetConfigBaseWithSource,
    DatasetConfigBaseWithSources,
    DatasetConfigWithMasking,
    DatasetSourceConfigBase,
} from './core/baseConfig';
import type { BDTopoDatasetConfig } from './BDTopo';
import type { CityJSONDatasetConfig } from './CityJSON';
import type { CSVPointCloudDatasetConfig } from './CSVPointCloud';
import type { GeoJSONAsLayerDatasetConfig, GeoJSONAsMeshDatasetConfig } from './GeoJSON';
import type { GeopackageDatasetConfig } from './Geopackage';
import type { GPXAsLayerDatasetConfig, GPXAsMeshDatasetConfig } from './GPX';
import type { IFCDatasetConfig } from './IFC';
import type { KMLAsLayerDatasetConfig, KMLAsMeshDatasetConfig } from './KML';
import type { LASDatasetConfig } from './LAS';
import type { PLYDatasetConfig } from './PLY';
import type { PotreePointCloudDatasetConfig } from './PotreePointCloud';
import type { ShapefileDatasetConfig } from './Shapefile';
import type { TiledPointCloudDatasetConfig } from './TiledPointCloud';
import { VectorAsLayerDatasetConfigBase } from './core/vector';
import { VectorSourceAsLayerConfig } from '../sources/core/vector';

export type DatasetConfig =
    | BDTopoDatasetConfig
    | CityJSONDatasetConfig
    | CSVPointCloudDatasetConfig
    | GeoJSONAsLayerDatasetConfig
    | GeoJSONAsMeshDatasetConfig
    | GeopackageDatasetConfig
    | GPXAsLayerDatasetConfig
    | GPXAsMeshDatasetConfig
    | IFCDatasetConfig
    | KMLAsLayerDatasetConfig
    | KMLAsMeshDatasetConfig
    | LASDatasetConfig
    | PLYDatasetConfig
    | PotreePointCloudDatasetConfig
    | ShapefileDatasetConfig
    | TiledPointCloudDatasetConfig;

// Extracting type does not work, as UrlOrData extends string, thus it would pick everything
// and not filter-out anything :(
// We should change the names of the fields if we wanted this, thus breaking the config API.
// Let's do this later.
// export type DatasetConfigImportable = Extract<
//     DatasetConfig,
//     DatasetConfigWithSingleUrlOrData | DatasetConfigWithMultipleUrlOrData
// >;
export type DatasetConfigImportable =
    | CityJSONDatasetConfig
    | CSVPointCloudDatasetConfig
    | GeoJSONAsLayerDatasetConfig
    | GeoJSONAsMeshDatasetConfig
    | GeopackageDatasetConfig
    | GPXAsLayerDatasetConfig
    | GPXAsMeshDatasetConfig
    | IFCDatasetConfig
    | KMLAsLayerDatasetConfig
    | KMLAsMeshDatasetConfig
    | LASDatasetConfig
    | ShapefileDatasetConfig;

// Same here :(
// export type DatasetConfigMultiple = Extract<
//     DatasetConfig,
//     DatasetConfigWithMultipleUrl | DatasetConfigWithMultipleUrlOrData
// >;
export type DatasetConfigMultiple =
    | CSVPointCloudDatasetConfig
    | GeoJSONAsMeshDatasetConfig
    | GeopackageDatasetConfig
    | GPXAsMeshDatasetConfig
    | KMLAsMeshDatasetConfig
    | LASDatasetConfig
    | ShapefileDatasetConfig;

export type DatasetType = DatasetConfig['type'];
/** List of dataset types that can be drag-and-dropped into the app */
export type DatasetTypeImportable = DatasetConfigImportable['type'];
/** List of dataset types that support multiple URL sources in their configuration */
export type DatasetTypeMultiple = DatasetConfigMultiple['type'];

export type DatasetSourceConfig =
    | Extract<
          DatasetConfig,
          DatasetConfigBaseWithSource<DatasetType, DatasetSourceConfigBase<DatasetType>>
      >['source']
    | Extract<
          Extract<
              DatasetConfig,
              DatasetConfigBaseWithSources<DatasetType, DatasetSourceConfigBase<DatasetType>>
          >['source'],
          DatasetSourceConfigBase<DatasetType>
      >;

export type DatasetAsLayerSourceConfig = Extract<DatasetSourceConfig, VectorSourceAsLayerConfig>;

export type DatasetAsLayerConfig = Extract<
    DatasetConfig,
    VectorAsLayerDatasetConfigBase<DatasetType, DatasetAsLayerSourceConfig>
>;

export interface DatagroupConfig
    extends DatasetConfigBase<'group'>,
        DatasetCascadingConfig,
        DatasetConfigWithMasking {
    /** Datasets contained in this group */
    children: DatasetOrGroupConfig[];
}
export type DatasetOrGroupConfig = DatasetConfig | DatagroupConfig;
