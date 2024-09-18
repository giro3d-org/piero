import type { BingMapsSourceConfig } from '@/types/configuration/sources/bingMaps';
import type { GeoTIFFSourceConfig } from '@/types/configuration/sources/geotiff';
import type { GeoJSONAsLayerSourceConfig } from '@/types/configuration/sources/geojson';
import type { GPXAsLayerSourceConfig } from '@/types/configuration/sources/gpx';
import type { KMLAsLayerSourceConfig } from '@/types/configuration/sources/kml';
import type { MVTSourceConfig } from '@/types/configuration/sources/mvt';
import type { OSMSourceConfig } from '@/types/configuration/sources/osm';
import type { StadiaMapsSourceConfig } from '@/types/configuration/sources/stadiaMaps';
import type { WMSSourceConfig } from '@/types/configuration/sources/wms';
import type { WMTSSourceConfig } from '@/types/configuration/sources/wmts';
import type { XYZSourceConfig } from '@/types/configuration/sources/xyz';
import type { ColorLayerConfig, ElevationLayerConfig, MaskLayerConfig } from './core/baseConfig';
import type { CustomVectorSourceConfig } from './core/vector';
import type { CustomVectorTileSourceConfig } from './core/vectorTile';

/** Supported layer sources */
export type LayerSourceConfig =
    | BingMapsSourceConfig
    | GeoTIFFSourceConfig
    | GeoJSONAsLayerSourceConfig
    | GPXAsLayerSourceConfig
    | KMLAsLayerSourceConfig
    | MVTSourceConfig
    | OSMSourceConfig
    | StadiaMapsSourceConfig
    | CustomVectorSourceConfig
    | CustomVectorTileSourceConfig
    | WMSSourceConfig
    | WMTSSourceConfig
    | XYZSourceConfig;

/** Supported layer source types */
export type LayerSourceType = LayerSourceConfig['type'];

/** Available configuration for layer sources */
export type BasemapLayerSourceConfig = LayerSourceConfig;

/** Available configuration for overlay sources */
export type OverlaySourceConfig = LayerSourceConfig;

/** Overlay configuration */
export interface OverlayConfig extends Omit<ColorLayerConfig, 'type'> {
    /** Source configuration */
    source: OverlaySourceConfig;
}

/** Layer configuration */
export type LayerConfig = ColorLayerConfig | ElevationLayerConfig | MaskLayerConfig;
/** Supported Giro3D layer types */
export type LayerType = LayerConfig['type'];
