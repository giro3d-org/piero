import type { SourceConfigBase } from './core/baseConfig';
import type { VectorAsLayerSourceConfigMixin, VectorAsMeshSourceConfigMixin } from './core/vector';

/** GeoJSON source configuration when displayed as a map layer */
export interface GeoJSONAsLayerSourceConfig
    extends SourceConfigBase<'geojson'>,
        VectorAsLayerSourceConfigMixin {}

/** GeoJSON source configuration when displayed as meshes */
export interface GeoJSONAsMeshSourceConfig
    extends SourceConfigBase<'geojson'>,
        VectorAsMeshSourceConfigMixin {}
