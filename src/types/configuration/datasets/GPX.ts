import { GPXAsLayerSourceConfig, GPXAsMeshSourceConfig } from '../sources/gpx';
import { VectorAsLayerDatasetConfigBase, VectorAsMeshDatasetConfigBase } from './core/vector';

export type GPXAsMeshDatasetConfig = VectorAsMeshDatasetConfigBase<'gpx', GPXAsMeshSourceConfig>;
export type GPXAsLayerDatasetConfig = VectorAsLayerDatasetConfigBase<'gpx', GPXAsLayerSourceConfig>;
