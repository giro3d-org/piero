import type {
    DatasetConfigBase,
    DatasetConfigWithLocation,
    DatasetConfigWithSingleUrlOrData,
} from './core/baseConfig';

export interface IFCDatasetConfig
    extends DatasetConfigBase<'ifc'>,
        DatasetConfigWithSingleUrlOrData,
        DatasetConfigWithLocation {}
