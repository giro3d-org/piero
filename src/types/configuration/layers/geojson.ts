import { VectorSourceBaseConfig } from './core/vector';

export interface GeoJSONSourceConfig extends Omit<VectorSourceBaseConfig<'geojson'>, 'format'> {}
