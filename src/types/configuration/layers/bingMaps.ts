import type { Options as BingMapsOptions } from 'ol/source/BingMaps';

import type { SourceConfigBase } from './core/baseConfig';

/** Bing maps source configuration */
export interface BingMapsSourceConfig
    extends Pick<BingMapsOptions, 'hidpi' | 'culture' | 'key' | 'imagerySet'>,
        SourceConfigBase<'bingmaps'> {}
