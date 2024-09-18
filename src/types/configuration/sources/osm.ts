import type { Options as OSMOptions } from 'ol/source/OSM';

import type {
    ImageSourceConfig,
    SourceConfigBase,
} from '@/types/configuration/sources/core/baseConfig';

/** OSM source configuration */
export interface OSMSourceConfig
    extends SourceConfigBase<'osm'>,
        ImageSourceConfig,
        Pick<OSMOptions, 'url'> {}
