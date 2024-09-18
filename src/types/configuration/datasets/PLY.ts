import type {
    DatasetSourceConfigLocation,
    DatasetSourceConfigUrlOrData,
    DatasetSourceConfigBase,
    DatasetConfigBaseWithSource,
} from './core/baseConfig';

export interface PLYDatasetSourceConfig
    extends DatasetSourceConfigBase<'ply'>,
        DatasetSourceConfigUrlOrData,
        Required<DatasetSourceConfigLocation> {}

export interface PLYDatasetConfig
    extends DatasetConfigBaseWithSource<'ply', PLYDatasetSourceConfig> {}
