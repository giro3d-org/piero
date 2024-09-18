import type {
    DatasetConfigBase,
    DatasetConfigWithLocation,
    DatasetConfigWithSingleUrlOrData,
} from './core/baseConfig';

export interface PLYDatasetConfig
    extends DatasetConfigBase<'ply'>,
        DatasetConfigWithSingleUrlOrData,
        Required<DatasetConfigWithLocation> {}
