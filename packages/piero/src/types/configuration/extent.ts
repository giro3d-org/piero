import Giro3DExtent from '@giro3d/giro3d/core/geographic/Extent';
import z from 'zod';

import { CrsName } from './crs';

export const ExtentObject = z.object({
    crs: CrsName,
    maxx: z.number(),
    maxy: z.number(),
    minx: z.number(),
    miny: z.number(),
});
export type ExtentObject = z.infer<typeof ExtentObject>;
z.globalRegistry.add(ExtentObject, { id: 'ExtentObject' });

export const ExtentTuple = z.tuple([
    z.number().describe('minx'),
    z.number().describe('miny'),
    z.number().describe('maxx'),
    z.number().describe('maxy'),
]);
export type ExtentTuple = z.infer<typeof ExtentTuple>;
z.globalRegistry.add(ExtentTuple, { id: 'ExtentTuple' });

export const Extent = z.union([ExtentObject, ExtentTuple]);
export type Extent = z.infer<typeof Extent>;
z.globalRegistry.add(Extent, { id: 'Extent' });

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
