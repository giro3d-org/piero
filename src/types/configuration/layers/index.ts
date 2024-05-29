import type {
    ColorLayerConfig,
    ElevationLayerConfig,
    SourceConfigBase,
    MaskLayerConfig,
} from './core/baseConfig';
import type { BingMapsSourceConfig } from './bingMaps';
import type { COGSourceConfig } from './cog';
import type { GeoJSONSourceConfig } from './geojson';
import type { GPXSourceConfig } from './gpx';
import type { KMLSourceConfig } from './kml';
import type { MVTSourceConfig } from './mvt';
import type { OSMSourceConfig } from './osm';
import type { StadiaMapsSourceConfig } from './stadiaMaps';
import type { VectorSourceConfig } from './core/vector';
import type { VectorTileSourceConfig } from './core/vectorTile';
import type { WMSSourceConfig } from './wms';
import type { WMTSSourceConfig } from './wmts';
import type { XYZSourceConfig } from './xyz';

/** Supported layer sources */
export type SourceConfig =
    | BingMapsSourceConfig
    | COGSourceConfig
    | GeoJSONSourceConfig
    | GPXSourceConfig
    | KMLSourceConfig
    | MVTSourceConfig
    | OSMSourceConfig
    | StadiaMapsSourceConfig
    | VectorSourceConfig
    | VectorTileSourceConfig
    | WMSSourceConfig
    | WMTSSourceConfig
    | XYZSourceConfig;

/** Supported layer source types */
export type LayerSourceType = SourceConfig['type'];

/** Available configuration for layer sources */
export type BasemapLayerSourceConfig = SourceConfig;

/** Available configuration for overlay sources */
export type OverlaySourceConfig = SourceConfig;

/** Overlay configuration */
export interface OverlayConfig extends Omit<ColorLayerConfig, 'type'> {
    /** Source configuration */
    source: OverlaySourceConfig;
}

/**
 * Vector overlay configuration
 *
 * @deprecated Use 'source' field instead. Will be removed in release v24.7.
 */
export type OverlayVectorConfigDeprecated = Omit<OverlayConfig, 'source'> & VectorSourceConfig;
/**
 * Vector tile overlay configuration
 *
 * @deprecated Use 'source' field instead. Will be removed in release v24.7.
 */
export type OverlayVectorTileConfigDeprecated = Omit<OverlayConfig, 'source'> & MVTSourceConfig;
/**
 * Raster overlay configuration
 *
 * @deprecated Use 'source' field instead. Will be removed in release v24.7.
 */
export type OverlayRasterConfigDeprecated = OverlayConfig & SourceConfigBase<'wms' | 'wmts'>;

export type LayerConfig = ColorLayerConfig | ElevationLayerConfig | MaskLayerConfig;
export type LayerType = LayerConfig['type'];
