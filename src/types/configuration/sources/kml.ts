import { VectorSourceAsLayerConfig } from '@/types/configuration/sources/core/vector';
import { SourceConfigBase } from './core/baseConfig';

export interface KMLSourceConfig extends SourceConfigBase<'kml'>, VectorSourceAsLayerConfig {}
