import type {
    DatasetConfigWithDataProjection,
    DatasetConfigWithMultipleUrlOrData,
} from './core/baseConfig';
import type { VectorDatasetConfig } from './core/vector';

export interface GeoJSONDatasetConfig
    extends VectorDatasetConfig<'geojson'>,
        DatasetConfigWithMultipleUrlOrData,
        DatasetConfigWithDataProjection {}
