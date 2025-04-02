import getConfig from '@/config-loader';
import type { ColorMapConfig } from '@/types/configuration/color';
import type { ExperimentalFeatures } from '@/types/configuration/features';
import type { GeoExtent, GeoVec3 } from '@/types/configuration/geographic';
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
    const config = getConfig();
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
    const config = getConfig();
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
    const config = getConfig();
    return extent
        ? new Extent(extent.crs ?? config.default_crs, extent).as(config.default_crs)
        : undefined;
}
