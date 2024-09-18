import type {
    GeoJSONAsLayerSourceConfig,
    GeoJSONAsMeshSourceConfig,
} from '@/types/configuration/sources/geojson';
import type { VectorAsLayerDatasetConfigBase, VectorAsMeshDatasetConfigBase } from './core/vector';

/** GeoJSON dataset configuration when displayed as a map layer */
export interface GeoJSONAsLayerDatasetConfig
    extends VectorAsLayerDatasetConfigBase<'geojson', GeoJSONAsLayerSourceConfig> {}

/** GeoJSON dataset configuration, displayed as meshes */
export interface GeoJSONAsMeshDatasetConfig
    extends VectorAsMeshDatasetConfigBase<'geojson', GeoJSONAsMeshSourceConfig> {}
