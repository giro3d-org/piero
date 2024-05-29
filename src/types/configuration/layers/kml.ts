import { VectorSourceBaseConfig } from './core/vector';

export interface KMLSourceConfig extends Omit<VectorSourceBaseConfig<'kml'>, 'format'> {}
