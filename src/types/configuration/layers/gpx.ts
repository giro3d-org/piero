import { VectorSourceBaseConfig } from '@/types/configuration/layers/core/vector';

export interface GPXSourceConfig extends Omit<VectorSourceBaseConfig<'gpx'>, 'format'> {}
