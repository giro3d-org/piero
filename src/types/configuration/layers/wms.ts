import type { CRS } from '@/types/configuration/geographic';
import type { TiledImageSourceBaseConfig } from '@/types/configuration/layers/core/tiled';

/** WMS source configuration */
export interface WMSSourceConfig extends TiledImageSourceBaseConfig<'wms'> {
    /** CRS of the source - must be registered first */
    projection?: CRS;
    /** Name of the layer, as available in the `getCapabilities` of the source */
    layer: string | string[];
    /**
     * URL of the source.
     * Should be the endpoint without parameters, e.g. `'https://data.geopf.fr/wms-r'`
     */
    url: string;
}
