import type { Options as OSMOptions } from 'ol/source/OSM';

import type { ImageSourceConfigMixin, SourceConfigBase } from './core/baseConfig';

/** OSM source configuration */
export interface OSMSourceConfig
    extends ImageSourceConfigMixin,
        Pick<OSMOptions, 'url'>,
        SourceConfigBase<'osm'> {}
