import { KMLSourceConfig } from '../sources/kml';
import { DatasetConfigBaseWithSources } from './core/baseConfig';

export interface KMLDatasetConfig extends DatasetConfigBaseWithSources<'kml', KMLSourceConfig> {}
