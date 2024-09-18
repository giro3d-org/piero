import type { SourceConfigBase } from './core/baseConfig';
import type { VectorAsLayerSourceConfigMixin, VectorAsMeshSourceConfigMixin } from './core/vector';

/** KML source configuration when displayed as a map layer */
export interface KMLAsLayerSourceConfig
    extends SourceConfigBase<'kml'>,
        VectorAsLayerSourceConfigMixin {}

/** KML source configuration when displayed as meshes */
export interface KMLAsMeshSourceConfig
    extends SourceConfigBase<'kml'>,
        VectorAsMeshSourceConfigMixin {}
