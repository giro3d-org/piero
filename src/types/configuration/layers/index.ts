import type {
    ColorLayerConfig,
    ElevationLayerConfig,
    SourceConfigBase,
    MaskLayerConfig,
} from '@/types/configuration/layers/core/baseConfig';
import type { BingMapsSourceConfig } from '@/types/configuration/layers/bingMaps';
import type { COGSourceConfig } from '@/types/configuration/layers/cog';
import type { GeoJSONSourceConfig } from '@/types/configuration/layers/geojson';
import type { GPXSourceConfig } from '@/types/configuration/layers/gpx';
import type { KMLSourceConfig } from '@/types/configuration/layers/kml';
import type { MVTSourceConfig } from '@/types/configuration/layers/mvt';
import type { OSMSourceConfig } from '@/types/configuration/layers/osm';
import type { StadiaMapsSourceConfig } from '@/types/configuration/layers/stadiaMaps';
import type { VectorSourceConfig } from '@/types/configuration/layers/core/vector';
import type { VectorTileSourceConfig } from '@/types/configuration/layers/core/vectorTile';
import type { WMSSourceConfig } from '@/types/configuration/layers/wms';
import type { WMTSSourceConfig } from '@/types/configuration/layers/wmts';
import type { XYZSourceConfig } from '@/types/configuration/layers/xyz';

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
