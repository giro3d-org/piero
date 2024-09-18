import type { CRS } from '@/types/configuration/geographic';
import type { TiledImageSourceConfig } from '@/types/configuration/sources/core/tiled';
import { SourceConfigBase } from './core/baseConfig';
import { DatasetSourceConfigDataProjection } from '../datasets/core/baseConfig';

/** WMTS source configuration */
export interface WMTSSourceConfig
    extends SourceConfigBase<'wmts'>,
        TiledImageSourceConfig,
        DatasetSourceConfigDataProjection {
    /** @deprecated Use {@link dataProjection} instead, will be removed in 24.10 */
    projection?: CRS;
    /** Name of the layer, as available in the `getCapabilities` of the source */
    layer: string;
    /**
     * URL of the source.
     * Should be the URL pointing to the `getCapabilities`, e.g. `https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities`,
     */
    url: string;
}
