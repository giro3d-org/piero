import type { VectorTileSourceOptions } from '@giro3d/giro3d/sources/VectorTileSource';

import type { VectorStyle } from '@/types/VectorStyle';
import type { SourceConfigBase } from './baseConfig';

/** Base configuration for vector tiled layers */
export interface VectorTileSourceBaseConfig<TType extends string>
    extends Pick<VectorTileSourceOptions, 'url' | 'backgroundColor' | 'format'>,
        SourceConfigBase<TType> {}

/** VectorTile source with custom format */
export interface VectorTileSourceConfig
    extends Pick<VectorTileSourceOptions, 'url' | 'backgroundColor' | 'format'>,
        SourceConfigBase<'vector-tile'> {
    /** Style */
    style: VectorStyle;
}
