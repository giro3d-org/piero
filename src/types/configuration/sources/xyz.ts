import type { Options as XYZOptions } from 'ol/source/XYZ';

import type { CRS } from '@/types/configuration/geographic';
import type { TiledImageSourceConfig } from '@/types/configuration/sources/core/tiled';
import { SourceConfigBase } from './core/baseConfig';
import { DatasetSourceConfigDataProjection } from '../datasets/core/baseConfig';

/** XYZ source configuration */
export interface XYZSourceConfig
    extends SourceConfigBase<'xyz'>,
        TiledImageSourceConfig,
        DatasetSourceConfigDataProjection,
        Pick<XYZOptions, 'url' | 'urls'> {
    /** @deprecated Use {@link dataProjection} instead, will be removed in 24.10 */
    projection?: CRS;
}
