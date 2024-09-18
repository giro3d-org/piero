import {
    VectorSourceAsLayerConfig,
    VectorSourceAsMeshConfig,
} from '@/types/configuration/sources/core/vector';
import { SourceConfigBase } from './core/baseConfig';

export interface GPXAsLayerSourceConfig
    extends SourceConfigBase<'gpx'>,
        VectorSourceAsLayerConfig {}
export interface GPXAsMeshSourceConfig extends SourceConfigBase<'gpx'>, VectorSourceAsMeshConfig {}
