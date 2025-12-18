import z from 'zod';

import { CrsName } from './crs';
import { Degree } from './Degree';
import { Meter } from './Meter';

export const CoordinateObject = z.object({
    crs: CrsName,
    x: z.number(),
    y: z.number(),
    z: z.number().optional(),
});
export type CoordinateObject = z.infer<typeof CoordinateObject>;
z.globalRegistry.add(CoordinateObject, { id: 'CoordinateObject' });

export const LatLon = z.object({
    altitude: Meter.optional(),
    latitude: Degree,
    longitude: Degree,
});
export type LatLon = z.infer<typeof LatLon>;
z.globalRegistry.add(LatLon, { id: 'LatLon' });

export const Coordinate2D = z.tuple([z.number(), z.number()]);
export type Coordinate2D = z.infer<typeof Coordinate2D>;
z.globalRegistry.add(Coordinate2D, { id: 'Coordinate2D' });

export const Coordinate3D = z.tuple([z.number(), z.number(), z.number()]);
export type Coordinate3D = z.infer<typeof Coordinate3D>;
z.globalRegistry.add(Coordinate3D, { id: 'Coordinate3D' });

export const Coordinate = z.union([CoordinateObject, Coordinate2D, Coordinate3D, LatLon]);
export type Coordinate = z.infer<typeof Coordinate>;
z.globalRegistry.add(Coordinate, { id: 'Coordinate' });
