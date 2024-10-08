import type { VectorTileSourceOptions } from '@giro3d/giro3d/sources/VectorTileSource';

import type { ImageSourceConfigMixin } from './baseConfig';
import type { VectorStyle } from '@/types/VectorStyle';

/** Mixin configuration for vector tiled layers */
export interface VectorTileSourceConfigMixin
    extends Pick<VectorTileSourceOptions, 'url' | 'backgroundColor'>,
        ImageSourceConfigMixin {
    /** Style */
    style: VectorStyle;
}
