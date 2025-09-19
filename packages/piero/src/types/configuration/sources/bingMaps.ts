import type { Options as BingMapsOptions } from 'ol/source/BingMaps';

import type { ImageSourceConfigMixin, SourceConfigBase } from './core/baseConfig';

/** Bing maps source configuration */
export interface BingMapsSourceConfig
    extends ImageSourceConfigMixin,
        Pick<BingMapsOptions, 'culture' | 'hidpi' | 'imagerySet' | 'key'>,
        SourceConfigBase<'bingmaps'> {}
