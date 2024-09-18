import {
    VectorSourceAsLayerConfig,
    VectorSourceAsMeshConfig,
} from '@/types/configuration/sources/core/vector';
import { SourceConfigBase } from './core/baseConfig';

export interface KMLAsLayerSourceConfig
    extends SourceConfigBase<'kml'>,
        VectorSourceAsLayerConfig {}
export interface KMLAsMeshSourceConfig extends SourceConfigBase<'kml'>, VectorSourceAsMeshConfig {}
