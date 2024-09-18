import type { DatasetConfigBase, DatasetConfigWithDataProjection } from './baseConfig';

export interface PointCloudDatasetConfig<TType extends string>
    extends DatasetConfigBase<TType>,
        DatasetConfigWithDataProjection {}
