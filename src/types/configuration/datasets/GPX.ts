import type {
    DatasetConfigWithDataProjection,
    DatasetConfigWithMultipleUrlOrData,
} from './core/baseConfig';
import type { VectorDatasetConfig } from './core/vector';

export interface GPXDatasetConfig
    extends VectorDatasetConfig<'gpx'>,
        DatasetConfigWithMultipleUrlOrData,
        DatasetConfigWithDataProjection {}
