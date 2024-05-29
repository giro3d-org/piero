import type { VectorSourceOptions } from '@giro3d/giro3d/sources/VectorSource';

import type { CRS } from '@/types/configuration/geographic';
import type { VectorStyle } from '@/types/VectorStyle';
import type { SourceConfigBase } from './baseConfig';

/** Base configuration for Vector sources */
export interface VectorSourceBaseConfig<TType extends string>
    extends Pick<VectorSourceOptions, 'format'>,
        SourceConfigBase<TType> {
    /** CRS of the source - must be registered first */
    projection: CRS;
    /** URL of the source. */
    url: string;
    /** Style */
    style: VectorStyle;
}

/** Vector source with custom format */
export interface VectorSourceConfig extends VectorSourceBaseConfig<'vector'> {}
