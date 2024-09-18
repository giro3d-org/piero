import { VectorSourceAsLayerConfig } from '@/types/configuration/sources/core/vector';
import { SourceConfigBase } from './core/baseConfig';

export interface GPXSourceConfig extends SourceConfigBase<'gpx'>, VectorSourceAsLayerConfig {}
