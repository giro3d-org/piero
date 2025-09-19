import type { Options as XYZOptions } from 'ol/source/XYZ';

import type { CRS } from '@/types/configuration/geographic';

import type { SourceConfigBase, SourceConfigProjectionMixin } from './core/baseConfig';
import type { TiledImageSourceConfigMixin } from './core/tiled';

/** XYZ source configuration */
export interface XYZSourceConfig
    extends Pick<XYZOptions, 'url' | 'urls'>,
        SourceConfigBase<'xyz'>,
        SourceConfigProjectionMixin,
        TiledImageSourceConfigMixin {
    /** @deprecated Use {@link dataProjection} instead, will be removed in 24.10 */
    projection?: CRS;
}
