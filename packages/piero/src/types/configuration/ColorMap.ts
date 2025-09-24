import Giro3DColorMap from '@giro3d/giro3d/core/ColorMap';
import chroma from 'chroma-js';
import { Color } from 'three';
import z from 'zod';

export const ColorRampName = z.union([
    z.literal('OrRd'),
    z.literal('PuBu'),
    z.literal('BuPu'),
    z.literal('Oranges'),
    z.literal('BuGn'),
    z.literal('YlOrBr'),
    z.literal('YlGn'),
    z.literal('Reds'),
    z.literal('RdPu'),
    z.literal('Greens'),
    z.literal('YlGnBu'),
    z.literal('Purples'),
    z.literal('GnBu'),
    z.literal('Greys'),
    z.literal('YlOrRd'),
    z.literal('PuRd'),
    z.literal('Blues'),
    z.literal('PuBuGn'),
    z.literal('Viridis'),
    z.literal('Spectral'),
    z.literal('RdYlGn'),
    z.literal('RdBu'),
    z.literal('PiYG'),
    z.literal('PRGn'),
    z.literal('RdYlBu'),
    z.literal('BrBG'),
    z.literal('RdGy'),
    z.literal('PuOr'),
    z.literal('Set2'),
    z.literal('Accent'),
    z.literal('Set1'),
    z.literal('Set3'),
    z.literal('Dark2'),
    z.literal('Paired'),
    z.literal('Pastel2'),
    z.literal('Pastel1'),
]);
export type ColorRampName = z.infer<typeof ColorRampName>;
z.globalRegistry.add(ColorRampName, { id: 'ColorRampName' });

export const ColorMap = z.object({
    max: z.number(),
    min: z.number(),
    ramp: ColorRampName,
});
export type ColorMap = z.infer<typeof ColorMap>;
z.globalRegistry.add(ColorMap, { id: 'ColorMap' });

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
