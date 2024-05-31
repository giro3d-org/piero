import type { CRS } from '@/types/configuration/geographic';
import type { TiledImageSourceBaseConfig } from '@/types/configuration/layers/core/tiled';

/** WMTS source configuration */
export interface WMTSSourceConfig extends TiledImageSourceBaseConfig<'wmts'> {
    /** CRS of the source - must be registered first */
    projection?: CRS;
    /** Name of the layer, as available in the `getCapabilities` of the source */
    layer: string;
    /**
     * URL of the source.
     * Should be the URL pointing to the `getCapabilities`, e.g. `https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities`,
     */
    url: string;
}
