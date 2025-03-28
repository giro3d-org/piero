import config from '@/config';
import type { ColorMapConfig } from '@/types/configuration/color';
import type { ExperimentalFeatures } from '@/types/configuration/features';
import type { CRS, GeoExtent, GeoVec3 } from '@/types/configuration/geographic';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import ColorMap from '@giro3d/giro3d/core/layer/ColorMap';
import chroma from 'chroma-js';
import { Color } from 'three';
import Download from './Download';

export function getPublicFolderUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // url is absolute
        return url;
    }

    return new URL(url, Download.getBaseUrl()).toString();
}

export function hasExperimentalFeature(feature: ExperimentalFeatures): boolean {
    return config.enabled_features?.includes(feature) ?? false;
}

export function getColorMap(config: ColorMapConfig): ColorMap {
    const colors = chroma
        .scale(config.ramp)
        .mode('lab')
        .colors(256)
        .map(c => {
            const rgb = chroma(c).gl();
            return new Color().setRGB(rgb[0], rgb[1], rgb[2], 'srgb');
        });
    return new ColorMap(colors, config.min, config.max, config.mode);
}

export function getCoordinates(geovec3: GeoVec3): Coordinates;
export function getCoordinates(): undefined;
export function getCoordinates(geovec3?: GeoVec3): Coordinates | undefined;
export function getCoordinates(geovec3?: GeoVec3): Coordinates | undefined {
    return geovec3
        ? new Coordinates(
              geovec3.crs ?? config.default_crs,
              geovec3.x,
              geovec3.y,
              geovec3.z ?? 0,
          ).as(config.default_crs)
        : undefined;
}

export function getExtent(extent: GeoExtent): Extent;
export function getExtent(): undefined;
export function getExtent(extent?: GeoExtent): Extent | undefined;
export function getExtent(extent?: GeoExtent): Extent | undefined {
    return extent
        ? new Extent(extent.crs ?? config.default_crs, extent).as(config.default_crs)
        : undefined;
}

export function getCrsDefinitions(): Record<CRS, string> {
    if (config.crs_definitions) {
        return config.crs_definitions;
    }

    console.warn(
        'Configuration is not specifying CRS definitions. You should define the projections you use. See https://gitlab.com/giro3d/piero/-/issues/78 for more information.',
    );

    return {
        'EPSG:2154':
            '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
        'EPSG:3857':
            '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
        'EPSG:3946':
            '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        'EPSG:3948':
            '+proj=lcc +lat_0=48 +lon_0=3 +lat_1=47.25 +lat_2=48.75 +x_0=1700000 +y_0=7200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
        'EPSG:4171': '+proj=longlat +ellps=GRS80 +no_defs +type=crs',
        'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs +type=crs',
        'IGNF:WGS84G':
            'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]',
    };
}
