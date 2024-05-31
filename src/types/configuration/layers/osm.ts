import type { Options as OSMOptions } from 'ol/source/OSM';

import type { SourceConfigBase } from '@/types/configuration/layers/core/baseConfig';

/** OSM source configuration */
export interface OSMSourceConfig extends Pick<OSMOptions, 'url'>, SourceConfigBase<'osm'> {}
