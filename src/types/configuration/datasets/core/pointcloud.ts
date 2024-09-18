import type { DatasetConfigBase, DatasetSourceConfigDataProjection } from './baseConfig';

export interface PointCloudDatasetConfig<TType extends string>
    extends DatasetConfigBase<TType>,
        DatasetSourceConfigDataProjection {}
