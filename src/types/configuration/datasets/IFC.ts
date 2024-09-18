import type {
    DatasetSourceConfigLocation,
    DatasetSourceConfigUrlOrData,
    DatasetSourceConfigBase,
    DatasetConfigBaseWithSource,
} from './core/baseConfig';

export interface IFCDatasetSourceConfig
    extends DatasetSourceConfigBase<'ifc'>,
        DatasetSourceConfigUrlOrData,
        DatasetSourceConfigLocation {}

export interface IFCDatasetConfig
    extends DatasetConfigBaseWithSource<'ifc', IFCDatasetSourceConfig> {}
