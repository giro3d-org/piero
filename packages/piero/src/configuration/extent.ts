import z from 'zod';

import { CrsName } from './crs';

export interface ExtentObject {
    crs: CrsName;
    maxx: number;
    maxy: number;
    minx: number;
    miny: number;
}
export const ExtentObject: z.ZodType<ExtentObject> = z.object({
    crs: CrsName,
    maxx: z.number(),
    maxy: z.number(),
    minx: z.number(),
    miny: z.number(),
});
z.globalRegistry.add(ExtentObject, { id: 'ExtentObject' });

export type ExtentTuple = [minx: number, miny: number, maxx: number, maxy: number];
export const ExtentTuple: z.ZodType<ExtentTuple> = z.tuple([
    z.number().describe('minx'),
    z.number().describe('miny'),
    z.number().describe('maxx'),
    z.number().describe('maxy'),
]);
z.globalRegistry.add(ExtentTuple, { id: 'ExtentTuple' });

export type Extent = ExtentObject | ExtentTuple;
export const Extent: z.ZodType<Extent> = z.union([ExtentObject, ExtentTuple]);
z.globalRegistry.add(Extent, { id: 'Extent' });
