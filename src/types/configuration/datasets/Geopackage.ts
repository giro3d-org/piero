import type {
    DatasetSourceConfigDataProjection,
    DatasetSourceConfigElevation,
    DatasetSourceConfigUrlOrData,
    DatasetSourceConfigBase,
    DatasetConfigBaseWithSources,
} from './core/baseConfig';

export interface GeopackageDatasetSourceConfig
    extends DatasetSourceConfigBase<'gpkg'>,
        DatasetSourceConfigUrlOrData,
        DatasetSourceConfigDataProjection,
        DatasetSourceConfigElevation {}

export interface GeopackageDatasetConfig
    extends DatasetConfigBaseWithSources<'gpkg', GeopackageDatasetSourceConfig> {}
