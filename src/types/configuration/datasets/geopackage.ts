import type {
    SourceConfigElevationMixin,
    SourceConfigProjectionMixin,
    SourceConfigUrlOrDataMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { DatasetSourceConfigBase, DatasetConfigWithSourcesBase } from './core/baseConfig';

/** Geopackage source configuration */
export interface GeopackageDatasetSourceConfig
    extends DatasetSourceConfigBase<'gpkg'>,
        SourceConfigUrlOrDataMixin,
        SourceConfigProjectionMixin,
        SourceConfigElevationMixin {}

/** Geopackage dataset configuration */
export interface GeopackageDatasetConfig
    extends DatasetConfigWithSourcesBase<'gpkg', GeopackageDatasetSourceConfig> {}
