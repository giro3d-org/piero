import Giro3DColorMap from '@giro3d/giro3d/core/ColorMap';
import Giro3DCoordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Giro3DExtent from '@giro3d/giro3d/core/geographic/Extent';
import chroma from 'chroma-js';
import { Color } from 'three';

import type { ColorMap } from '@/configuration/colormap';
import type { Coordinate } from '@/configuration/coordinate';
import type { CrsName } from '@/configuration/crs';
import type { Extent } from '@/configuration/extent';

import Download from './Download';

export function getPublicFolderUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // url is absolute
        return url;
    }

    return new URL(url, Download.getBaseUrl()).toString();
}

export function toGiro3DColorMap(config: ColorMap): Giro3DColorMap {
    const colors = chroma
        .scale(config.ramp)
        .mode('lab')
        .colors(256)
        .map(c => {
            const rgb = chroma(c).gl();
            return new Color().setRGB(rgb[0], rgb[1], rgb[2], 'srgb');
        });
    return new Giro3DColorMap({ colors, ...config });
}

export function toGiro3DCoordinates(input: Coordinate, sceneCrs: string): Giro3DCoordinates {
    if ('crs' in input) {
        return new Giro3DCoordinates(input.crs, input.x, input.y, input.z ?? 0);
    } else if (Array.isArray(input)) {
        if (input.length === 2) {
            return new Giro3DCoordinates(sceneCrs, input[0], input[1], 0);
        } else if (input.length === 3) {
            return new Giro3DCoordinates(sceneCrs, input[0], input[1], input[2]);
        }
    } else if ('latitude' in input) {
        return new Giro3DCoordinates(
            'EPSG:4326',
            input.longitude,
            input.latitude,
            input.altitude ?? 0,
        );
    }

    throw new Error('invalid coordinates');
}

export function toGiro3DExtent(input: Extent, sceneCrs: CrsName): Giro3DExtent {
    if (Array.isArray(input)) {
        return new Giro3DExtent(sceneCrs, ...input);
    } else {
        return new Giro3DExtent(input.crs, {
            east: input.maxx,
            north: input.maxy,
            south: input.miny,
            west: input.minx,
        });
    }
}
