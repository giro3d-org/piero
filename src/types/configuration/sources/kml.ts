import type { SourceConfigBase } from './core/baseConfig';
import type { VectorAsLayerSourceConfigMixin } from './core/vector';

/** KML source configuration when displayed as a map layer */
export interface KMLAsLayerSourceConfig
    extends SourceConfigBase<'kml'>,
        VectorAsLayerSourceConfigMixin {}
