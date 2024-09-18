import type { VectorTileSourceOptions } from '@giro3d/giro3d/sources/VectorTileSource';

import type { ImageSourceConfig } from '@/types/configuration/sources/core/baseConfig';

/** Base configuration for vector tiled layers */
export interface VectorTileSourceConfig
    extends Pick<VectorTileSourceOptions, 'url' | 'backgroundColor'>,
        ImageSourceConfig {}
