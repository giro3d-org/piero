import { GeoJSONAsLayerSourceConfig, GeoJSONAsMeshSourceConfig } from '../sources/geojson';
import { VectorAsLayerDatasetConfigBase, VectorAsMeshDatasetConfigBase } from './core/vector';

export interface GeoJSONAsMeshDatasetConfig
    extends VectorAsMeshDatasetConfigBase<'geojson', GeoJSONAsMeshSourceConfig> {}
export interface GeoJSONAsLayerDatasetConfig
    extends VectorAsLayerDatasetConfigBase<'geojson', GeoJSONAsLayerSourceConfig> {}
