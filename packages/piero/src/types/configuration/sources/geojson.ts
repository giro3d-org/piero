import type { SourceConfigBase } from './core/baseConfig';
import type { VectorAsLayerSourceConfigMixin } from './core/vector';

/** GeoJSON source configuration when displayed as a map layer */
export interface GeoJSONAsLayerSourceConfig
    extends SourceConfigBase<'geojson'>,
        VectorAsLayerSourceConfigMixin {}
