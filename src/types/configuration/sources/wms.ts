import type { CRS } from '@/types/configuration/geographic';
import type { TiledImageSourceConfig } from '@/types/configuration/sources/core/tiled';
import { SourceConfigBase } from './core/baseConfig';
import { DatasetSourceConfigDataProjection } from '../datasets/core/baseConfig';

/** WMS source configuration */
export interface WMSSourceConfig
    extends SourceConfigBase<'wms'>,
        TiledImageSourceConfig,
        DatasetSourceConfigDataProjection {
    /** @deprecated Use {@link dataProjection} instead, will be removed in 24.10 */
    projection?: CRS;
    /** Name of the layer, as available in the `getCapabilities` of the source */
    layer: string | string[];
    /**
     * URL of the source.
     * Should be the endpoint without parameters, e.g. `'https://data.geopf.fr/wms-r'`
     */
    url: string;
}
