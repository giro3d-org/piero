import { GPXAsLayerSourceConfig, GPXAsMeshSourceConfig } from '../sources/gpx';
import { VectorAsLayerDatasetConfigBase, VectorAsMeshDatasetConfigBase } from './core/vector';

export interface GPXAsMeshDatasetConfig
    extends VectorAsMeshDatasetConfigBase<'gpx', GPXAsMeshSourceConfig> {}
export interface GPXAsLayerDatasetConfig
    extends VectorAsLayerDatasetConfigBase<'gpx', GPXAsLayerSourceConfig> {}
