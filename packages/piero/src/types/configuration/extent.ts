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
