import type { Options as BingMapsOptions } from 'ol/source/BingMaps';

import type {
    ImageSourceConfig,
    SourceConfigBase,
} from '@/types/configuration/sources/core/baseConfig';

/** Bing maps source configuration */
export interface BingMapsSourceConfig
    extends SourceConfigBase<'bingmaps'>,
        ImageSourceConfig,
        Pick<BingMapsOptions, 'hidpi' | 'culture' | 'key' | 'imagerySet'> {}
