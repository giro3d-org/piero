import { GeoJSONSourceConfig } from '../sources/geojson';
import type { DatasetConfigBaseWithSources } from './core/baseConfig';

export interface GeoJSONDatasetConfig
    extends DatasetConfigBaseWithSources<'geojson', GeoJSONSourceConfig> {}
