import {
    VectorSourceAsLayerConfig,
    VectorSourceAsMeshConfig,
} from '@/types/configuration/sources/core/vector';
import { SourceConfigBase } from './core/baseConfig';

export interface GeoJSONAsLayerSourceConfig
    extends SourceConfigBase<'geojson'>,
        VectorSourceAsLayerConfig {}
export interface GeoJSONAsMeshSourceConfig
    extends SourceConfigBase<'geojson'>,
        VectorSourceAsMeshConfig {}
