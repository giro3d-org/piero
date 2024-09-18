import type {
    SourceConfigUrlMixin,
    SourceConfigUrlOrDataMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { VectorAsLayerSourceConfigMixin } from '@/types/configuration/sources/core/vector';
import type {
    DatasetCascadingConfig,
    DatasetConfigBase,
    DatasetConfigMaskingMixin,
} from './core/baseConfig';
import type { VectorAsLayerDatasetConfigBase } from './core/vector';
import type { BDTopoDatasetConfig } from './bdtopo';
import type { CityJSONDatasetConfig } from './cityjson';
import type { CSVPointCloudDatasetConfig } from './csvPointCloud';
import type { GeoJSONAsLayerDatasetConfig, GeoJSONAsMeshDatasetConfig } from './geojson';
import type { GeopackageDatasetConfig } from './geopackage';
import type { GPXAsLayerDatasetConfig, GPXAsMeshDatasetConfig } from './gpx';
import type { IFCDatasetConfig } from './ifc';
import type { KMLAsLayerDatasetConfig, KMLAsMeshDatasetConfig } from './kml';
import type { LASDatasetConfig } from './las';
import type { PLYDatasetConfig } from './ply';
import type { PotreePointCloudDatasetConfig } from './potreePointCloud';
import type { ShapefileDatasetConfig } from './shapefile';
import type { TiledPointCloudDatasetConfig } from './tiledPointCloud';

/** All supported datasets */
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

/** All datasets sources that can take a Blob (pre-requisite for being imported) */
type DatasetSourceConfigWithBlob = Exclude<
    Extract<DatasetSourceConfig, SourceConfigUrlOrDataMixin>,
    SourceConfigUrlMixin
>;

// For a dataset to be importable, the configuration should not have any required fields.
// TypeScript lets us filter on that with some black magic

type HasNoRequiredFields<T> = T extends { type: unknown; url: unknown }
    ? Partial<T> extends Omit<T, 'type' | 'url'>
        ? T
        : never
    : never;

type ExtractNoRequiredFields<T> = T extends HasNoRequiredFields<T> ? T : never;

/** All datasets sources that don't have any required fields */
type DatasetSourceConfigWithNoRequiredFields = ExtractNoRequiredFields<DatasetSourceConfig>;
/** All dataset sources that can be imported */
export type DatasetSourceConfigImportable = DatasetSourceConfigWithBlob &
    DatasetSourceConfigWithNoRequiredFields;

/**
 * All supported datasets that can be imported.
 *
 * Supporting import requires:
 * 1. The source to extend {@link SourceConfigUrlOrDataMixin}
 * 2. The source configuration to have only optional fields
 */
export type DatasetConfigImportable = Extract<
    DatasetConfigWithSource,
    { source: DatasetSourceConfigImportable | DatasetSourceConfigImportable[] }
>;

/** List of dataset types that can be imported into the app */
export type DatasetTypeImportable = DatasetConfigImportable['type'];

/** List of dataset sources that can be loaded as Giro3D layers */
export type DatasetAsLayerSourceConfig = Extract<
    DatasetSourceConfig,
    VectorAsLayerSourceConfigMixin
>;

/** List of datasets that can be loaded as Giro3D layers */
export type DatasetAsLayerConfig = Extract<
    DatasetConfig,
    VectorAsLayerDatasetConfigBase<DatasetType, DatasetAsLayerSourceConfig>
>;
