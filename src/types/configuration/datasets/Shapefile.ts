import type {
    DatasetSourceConfigElevation,
    DatasetSourceConfigUrlOrData,
    DatasetSourceConfigBase,
    DatasetConfigBaseWithSources,
} from './core/baseConfig';

export interface ShapefileDatasetSourceConfig
    extends DatasetSourceConfigBase<'shp'>,
        DatasetSourceConfigUrlOrData,
        DatasetSourceConfigElevation {}

export interface ShapefileDatasetConfig
    extends DatasetConfigBaseWithSources<'shp', ShapefileDatasetSourceConfig> {}
