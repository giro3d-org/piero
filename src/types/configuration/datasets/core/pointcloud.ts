import type { SourceConfigProjectionMixin } from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigBase } from './baseConfig';

export interface PointCloudDatasetConfig<TType extends string>
    extends DatasetConfigBase<TType>,
        SourceConfigProjectionMixin {}
