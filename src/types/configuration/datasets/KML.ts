import { KMLAsLayerSourceConfig, KMLAsMeshSourceConfig } from '../sources/kml';
import { VectorAsLayerDatasetConfigBase, VectorAsMeshDatasetConfigBase } from './core/vector';

export interface KMLAsMeshDatasetConfig
    extends VectorAsMeshDatasetConfigBase<'kml', KMLAsMeshSourceConfig> {}
export interface KMLAsLayerDatasetConfig
    extends VectorAsLayerDatasetConfigBase<'kml', KMLAsLayerSourceConfig> {}
