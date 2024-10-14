import type { BingMapsSourceConfig } from '@/types/configuration/sources/bingMaps';
import type { CustomVectorSourceConfig } from '@/types/configuration/sources/customVector';
import type { CustomVectorTileSourceConfig } from '@/types/configuration/sources/customVectorTile';
import type { GeoJSONAsLayerSourceConfig } from '@/types/configuration/sources/geojson';
import type { GeoTIFFSourceConfig } from '@/types/configuration/sources/geotiff';
import type { GPXAsLayerSourceConfig } from '@/types/configuration/sources/gpx';
import type { KMLAsLayerSourceConfig } from '@/types/configuration/sources/kml';
import type { MVTSourceConfig } from '@/types/configuration/sources/mvt';
import type { OSMSourceConfig } from '@/types/configuration/sources/osm';
import type { StadiaMapsSourceConfig } from '@/types/configuration/sources/stadiaMaps';
import type { WMSSourceConfig } from '@/types/configuration/sources/wms';
import type { WMTSSourceConfig } from '@/types/configuration/sources/wmts';
import type { XYZSourceConfig } from '@/types/configuration/sources/xyz';
import type { ColorLayerConfig, ElevationLayerConfig, MaskLayerConfig } from './core';

/** Supported layer sources */
export type LayerSourceConfig =
    | BingMapsSourceConfig
    | GeoTIFFSourceConfig
    | CustomVectorSourceConfig
    | CustomVectorTileSourceConfig
    | GeoJSONAsLayerSourceConfig
    | GPXAsLayerSourceConfig
    | KMLAsLayerSourceConfig
    | MVTSourceConfig
    | OSMSourceConfig
    | StadiaMapsSourceConfig
    | WMSSourceConfig
    | WMTSSourceConfig
    | XYZSourceConfig;

/** Supported layer source types */
export type LayerSourceType = LayerSourceConfig['type'];

/** Available configuration for layer sources */
export type BasemapLayerSourceConfig = LayerSourceConfig;

/** Available configuration for overlay sources */
export type OverlaySourceConfig = LayerSourceConfig;

// TODO: add mask overlays?
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
export type OverlayVectorConfigDeprecated = Omit<OverlayConfig, 'source'> &
    (GeoJSONAsLayerSourceConfig | GPXAsLayerSourceConfig | KMLAsLayerSourceConfig);
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
export type OverlayRasterConfigDeprecated = OverlayConfig & (WMSSourceConfig | WMTSSourceConfig);

/** Layer configuration */
export type LayerConfig = ColorLayerConfig | ElevationLayerConfig | MaskLayerConfig;
/** Supported Giro3D layer types */
export type LayerType = LayerConfig['type'];
