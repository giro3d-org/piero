import { BaseLayerType } from '../BaseLayer';
import { VectorStyle } from '../VectorStyle';
import { CRS } from './geographic';

/** Supported layer source types */
export type LayerSourceType = 'wms' | 'wmts' | 'cog' | 'geojson' | 'kml' | 'gpx' | 'mvt';

/** Base configuration for layers and overlays sources */
export type LayerSourceBaseConfig<TType extends LayerSourceType> = {
    /** Type of dataset */
    type: TType;
    /**
     * The relative resolution of the layer.
     * If greater than 1, the resolution will be greater, at the cost of performance and memory usage.
     * @defaultValue 1
     */
    resolution?: number;
};

/** WMS source configuration */
export type WMSSourceConfig = LayerSourceBaseConfig<'wms'> & {
    /** CRS of the source - must be registered first */
    projection?: CRS;
    /** Name of the layer, as available in the `getCapabilities` of the source */
    layer: string | string[];
    /**
     * File format
     *
     * @example `image/png`
     */
    format: string;
    /**
     * URL of the source.
     * Should be the endpoint without parameters, e.g. `'https://data.geopf.fr/wms-r'`
     */
    url: string;
    /** No data value, if any */
    nodata?: number;
};

/** WMTS source configuration */
export type WMTSSourceConfig = LayerSourceBaseConfig<'wmts'> & {
    /** CRS of the source - must be registered first */
    projection?: CRS;
    /** Name of the layer, as available in the `getCapabilities` of the source */
    layer: string;
    /**
     * File format
     *
     * @example `image/png`
     */
    format: string;
    /**
     * URL of the source.
     * Should be the URL pointing to the `getCapabilities`, e.g. `https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities`,
     */
    url: string;
    /** No data value, if any */
    nodata?: number;
};

/** COG source configuration */
export type COGSourceConfig = LayerSourceBaseConfig<'cog'> & {
    /** CRS of the source - must be registered first */
    projection: CRS;
    /** URL of the source. */
    url: string;
    /** No data value, if any */
    nodata?: number;
};

/** GeoJSON, KML and GPX source configuration */
export type VectorSourceConfig = LayerSourceBaseConfig<'geojson' | 'kml' | 'gpx'> & {
    /** CRS of the source - must be registered first */
    projection: CRS;
    /** URL of the source. */
    url: string;
    /** Style */
    style: VectorStyle;
};

/** MVT source configuration */
export type MVTSourceConfig = LayerSourceBaseConfig<'mvt'> & {
    /**
     * URL of the source.
     * Should include `{x},{y},{z}` components, e.g. `https://3d.oslandia.com/mysource/{z}/{x}/{y}.pbf`
     * */
    url: string;
    /** Style */
    style: VectorStyle;
    /** Background-color - empty for transparent */
    backgroundColor?: string;
};

/** Available configuration for layer sources */
export type BasemapLayerSourceConfig = WMSSourceConfig | WMTSSourceConfig | COGSourceConfig;

/** Basemap layer configuration */
export type LayerConfig = {
    /** Type of layer */
    type: BaseLayerType;
    /** Name of the layer displayed in the UI */
    name: string;
    /** Indicates if the layer should be loaded by default */
    visible: boolean;
    /** Source configuration */
    source: BasemapLayerSourceConfig;
};

/** Available configuration for overlay sources */
export type OverlaySourceConfig =
    | WMSSourceConfig
    | WMTSSourceConfig
    | COGSourceConfig
    | VectorSourceConfig
    | MVTSourceConfig;

/** Overlay configuration */
export type OverlayConfig = {
    /** Name of the overlay displayed in the UI */
    name: string;
    /** Default visibility of the overlay */
    visible: boolean;
    /** Source configuration */
    source: OverlaySourceConfig;
};

/**
 * Vector overlay configuration
 *
 * @deprecated Use 'source' field instead
 */
export type OverlayVectorConfigDeprecated = Omit<OverlayConfig, 'source'> & VectorSourceConfig;
/**
 * Vector tile overlay configuration
 *
 * @deprecated Use 'source' field instead
 */
export type OverlayVectorTileConfigDeprecated = Omit<OverlayConfig, 'source'> & MVTSourceConfig;
/**
 * Raster overlay configuration
 *
 * @deprecated Use 'source' field instead
 */
export type OverlayRasterConfigDeprecated = OverlayConfig & LayerSourceBaseConfig<'wms' | 'wmts'>;

/** Source configuration for layers or overlays */
export type LayerSourceConfig = BasemapLayerSourceConfig | OverlaySourceConfig;
