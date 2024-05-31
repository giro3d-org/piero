import { VectorSourceBaseConfig } from '@/types/configuration/layers/core/vector';

export interface KMLSourceConfig extends Omit<VectorSourceBaseConfig<'kml'>, 'format'> {}
