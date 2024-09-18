import type { DatasetConfigWithMultipleUrlOrData } from './core/baseConfig';
import type { VectorDatasetConfig } from './core/vector';

export interface GeopackageDatasetConfig
    extends VectorDatasetConfig<'gpkg'>,
        DatasetConfigWithMultipleUrlOrData {}
