import { GPXSourceConfig } from '../sources/gpx';
import type { DatasetConfigBaseWithSources } from './core/baseConfig';

export interface GPXDatasetConfig extends DatasetConfigBaseWithSources<'gpx', GPXSourceConfig> {}
