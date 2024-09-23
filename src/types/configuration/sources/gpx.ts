import type { SourceConfigBase } from './core/baseConfig';
import type { VectorAsLayerSourceConfigMixin } from './core/vector';

/** GPX source configuration when displayed as a map layer */
export interface GPXAsLayerSourceConfig
    extends SourceConfigBase<'gpx'>,
        VectorAsLayerSourceConfigMixin {}
