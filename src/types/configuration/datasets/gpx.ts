import type {
    GPXAsLayerSourceConfig,
    GPXAsMeshSourceConfig,
} from '@/types/configuration/sources/gpx';
import type { VectorAsLayerDatasetConfigBase, VectorAsMeshDatasetConfigBase } from './core/vector';

/** GPX dataset configuration when displayed as a map layer */
export interface GPXAsLayerDatasetConfig
    extends VectorAsLayerDatasetConfigBase<'gpx', GPXAsLayerSourceConfig> {}

/** GPX dataset configuration, displayed as meshes */
export interface GPXAsMeshDatasetConfig
    extends VectorAsMeshDatasetConfigBase<'gpx', GPXAsMeshSourceConfig> {}
