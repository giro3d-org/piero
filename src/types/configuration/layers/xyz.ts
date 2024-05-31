import type { Options as XYZOptions } from 'ol/source/XYZ';

import type { CRS } from '@/types/configuration/geographic';
import type { TiledImageSourceBaseConfig } from '@/types/configuration/layers/core/tiled';

/** XYZ source configuration */
export interface XYZSourceConfig
    extends TiledImageSourceBaseConfig<'xyz'>,
        Pick<XYZOptions, 'url' | 'urls'> {
    /** CRS of the source - must be registered first */
    projection?: CRS;
}
