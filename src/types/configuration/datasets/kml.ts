import type {
    KMLAsLayerSourceConfig,
    KMLAsMeshSourceConfig,
} from '@/types/configuration/sources/kml';
import type { VectorAsLayerDatasetConfigBase, VectorAsMeshDatasetConfigBase } from './core/vector';

/** KML dataset configuration when displayed as a map layer */
export interface KMLAsLayerDatasetConfig
    extends VectorAsLayerDatasetConfigBase<'kml', KMLAsLayerSourceConfig> {}

/** KML dataset configuration, displayed as meshes */
export interface KMLAsMeshDatasetConfig
    extends VectorAsMeshDatasetConfigBase<'kml', KMLAsMeshSourceConfig> {}
