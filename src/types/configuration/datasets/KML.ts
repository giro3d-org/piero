import type {
    DatasetConfigWithDataProjection,
    DatasetConfigWithMultipleUrlOrData,
} from './core/baseConfig';
import type { VectorDatasetConfig } from './core/vector';

export interface KMLDatasetConfig
    extends VectorDatasetConfig<'kml'>,
        DatasetConfigWithMultipleUrlOrData,
        DatasetConfigWithDataProjection {}
