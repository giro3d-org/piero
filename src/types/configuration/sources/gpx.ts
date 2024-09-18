import type { SourceConfigBase } from './core/baseConfig';
import type { VectorAsLayerSourceConfigMixin, VectorAsMeshSourceConfigMixin } from './core/vector';

/** GPX source configuration when displayed as a map layer */
export interface GPXAsLayerSourceConfig
    extends SourceConfigBase<'gpx'>,
        VectorAsLayerSourceConfigMixin {}

/** GPX source configuration when displayed as meshes */
export interface GPXAsMeshSourceConfig
    extends SourceConfigBase<'gpx'>,
        VectorAsMeshSourceConfigMixin {}
