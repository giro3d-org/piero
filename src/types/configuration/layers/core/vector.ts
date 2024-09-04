import type { VectorSourceOptions } from '@giro3d/giro3d/sources/VectorSource';

import type { CRS } from '@/types/configuration/geographic';
import type { VectorStyle } from '@/types/VectorStyle';
import type { SourceConfigBase } from '@/types/configuration/layers/core/baseConfig';
import FeatureFormat from 'ol/format/Feature';

/** Base configuration for Vector sources */
export interface VectorSourceBaseConfig<TType extends string>
    extends Pick<VectorSourceOptions, 'data'>,
        SourceConfigBase<TType> {
    /** CRS of the source - must be registered first */
    projection: CRS;
    /** URL of the source. */
    url: string;
    format: FeatureFormat;
    /** Style */
    style: VectorStyle;
}

/** Vector source with custom format */
export interface VectorSourceConfig extends VectorSourceBaseConfig<'vector'> {}
