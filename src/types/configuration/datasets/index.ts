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
import type { GeoJSONDatasetConfig } from './GeoJSON';
import type { GeopackageDatasetConfig } from './Geopackage';
import type { GPXDatasetConfig } from './GPX';
import type { IFCDatasetConfig } from './IFC';
import type { KMLDatasetConfig } from './KML';
import type { LASDatasetConfig } from './LAS';
import type { PLYDatasetConfig } from './PLY';
import type { PotreePointCloudDatasetConfig } from './PotreePointCloud';
import type { ShapefileDatasetConfig } from './Shapefile';
import type { TiledPointCloudDatasetConfig } from './TiledPointCloud';

export type DatasetConfig =
    | BDTopoDatasetConfig
    | CityJSONDatasetConfig
    | CSVPointCloudDatasetConfig
    | GeoJSONDatasetConfig
    | GeopackageDatasetConfig
    | GPXDatasetConfig
    | IFCDatasetConfig
    | KMLDatasetConfig
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
    | GeoJSONDatasetConfig
    | GeopackageDatasetConfig
    | GPXDatasetConfig
    | IFCDatasetConfig
    | KMLDatasetConfig
    | LASDatasetConfig
    | ShapefileDatasetConfig;

// Same here :(
// export type DatasetConfigMultiple = Extract<
//     DatasetConfig,
//     DatasetConfigWithMultipleUrl | DatasetConfigWithMultipleUrlOrData
// >;
export type DatasetConfigMultiple =
    | CSVPointCloudDatasetConfig
    | GeoJSONDatasetConfig
    | GeopackageDatasetConfig
    | GPXDatasetConfig
    | KMLDatasetConfig
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
          >['sources'],
          DatasetSourceConfigBase<DatasetType>
      >;

export interface DatagroupConfig
    extends DatasetConfigBase<'group'>,
        DatasetCascadingConfig,
        DatasetConfigWithMasking {
    /** Datasets contained in this group */
    children: DatasetOrGroupConfig[];
}
export type DatasetOrGroupConfig = DatasetConfig | DatagroupConfig;
