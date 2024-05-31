import { VectorSourceBaseConfig } from '@/types/configuration/layers/core/vector';

export interface GeoJSONSourceConfig extends Omit<VectorSourceBaseConfig<'geojson'>, 'format'> {}
