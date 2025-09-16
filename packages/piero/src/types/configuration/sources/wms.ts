import type { CRS } from '@/types/configuration/geographic';
import type { SourceConfigBase, SourceConfigProjectionMixin } from './core/baseConfig';
import type { TiledImageSourceConfigMixin } from './core/tiled';

/** WMS source configuration */
export interface WMSSourceConfig
    extends SourceConfigBase<'wms'>,
        TiledImageSourceConfigMixin,
        SourceConfigProjectionMixin {
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
