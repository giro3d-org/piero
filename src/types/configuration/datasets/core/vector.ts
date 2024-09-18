import type { DatasetConfigBase, DatasetConfigWithElevation } from './baseConfig';

export interface VectorDatasetConfig<TType extends string>
    extends DatasetConfigBase<TType>,
        DatasetConfigWithElevation {}
