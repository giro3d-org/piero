import type { DatasetConfigWithMultipleUrl } from './core/baseConfig';
import type { VectorDatasetConfig } from './core/vector';

export interface ShapefileDatasetConfig
    extends VectorDatasetConfig<'shp'>,
        DatasetConfigWithMultipleUrl {}
