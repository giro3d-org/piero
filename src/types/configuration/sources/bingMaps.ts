import type { Options as BingMapsOptions } from 'ol/source/BingMaps';
import type { ImageSourceConfigMixin, SourceConfigBase } from './core/baseConfig';

/** Bing maps source configuration */
export interface BingMapsSourceConfig
    extends SourceConfigBase<'bingmaps'>,
        ImageSourceConfigMixin,
        Pick<BingMapsOptions, 'hidpi' | 'culture' | 'key' | 'imagerySet'> {}
