import type {
    SourceConfigElevationMixin,
    SourceConfigUrlOrDataMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigWithSourcesBase, DatasetSourceConfigBase } from './core/baseConfig';

/** Shapefile source configuration */
export interface ShapefileDatasetSourceConfig
    extends DatasetSourceConfigBase<'shp'>,
        SourceConfigUrlOrDataMixin,
        SourceConfigElevationMixin {}

/** Shapefile dataset configuration */
export interface ShapefileDatasetConfig
    extends DatasetConfigWithSourcesBase<'shp', ShapefileDatasetSourceConfig> {}
