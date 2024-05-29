import { VectorSourceBaseConfig } from './core/vector';

export interface GPXSourceConfig extends Omit<VectorSourceBaseConfig<'gpx'>, 'format'> {}
