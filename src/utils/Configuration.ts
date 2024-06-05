import { Color } from 'three';
import chroma from 'chroma-js';
import { ColorMap } from '@giro3d/giro3d/core/layer';

import Download from './Download';
import type { ColorMapConfig } from '@/types/configuration/color';

export function getPublicFolderUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // url is absolute
        return url;
    }

    return new URL(url, Download.getBaseUrl()).toString();
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
