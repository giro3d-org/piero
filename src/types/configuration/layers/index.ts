import type {
    ColorLayerConfig,
    ElevationLayerConfig,
    MaskLayerConfig,
} from '@/types/configuration/layers/core/baseConfig';
import type { BingMapsSourceConfig } from '@/types/configuration/sources/bingMaps';
import type { GeoTIFFSourceConfig } from '@/types/configuration/sources/geotiff';
import type { GeoJSONSourceConfig } from '@/types/configuration/sources/geojson';
import type { GPXSourceConfig } from '@/types/configuration/sources/gpx';
import type { KMLSourceConfig } from '@/types/configuration/sources/kml';
import type { MVTSourceConfig } from '@/types/configuration/sources/mvt';
import type { OSMSourceConfig } from '@/types/configuration/sources/osm';
import type { StadiaMapsSourceConfig } from '@/types/configuration/sources/stadiaMaps';
import type { WMSSourceConfig } from '@/types/configuration/sources/wms';
import type { WMTSSourceConfig } from '@/types/configuration/sources/wmts';
import type { XYZSourceConfig } from '@/types/configuration/sources/xyz';
import { CustomVectorSourceConfig } from './core/vector';
import { CustomVectorTileSourceConfig } from './core/vectorTile';

/** Supported layer sources */
export type LayerSourceConfig =
    | BingMapsSourceConfig
    | GeoTIFFSourceConfig
    | GeoJSONSourceConfig
    | GPXSourceConfig
    | KMLSourceConfig
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

export type LayerConfig = ColorLayerConfig | ElevationLayerConfig | MaskLayerConfig;
export type LayerType = LayerConfig['type'];
