import z from 'zod';

import { CrsName } from './crs';
import { Degree, Meter } from './units';

export interface CoordinateObject {
    crs: CrsName;
    x: number;
    y: number;
    z?: number;
}
export const CoordinateObject: z.ZodType<CoordinateObject> = z.object({
    crs: CrsName,
    x: z.number(),
    y: z.number(),
    z: z.number().optional(),
});
z.globalRegistry.add(CoordinateObject, { id: 'CoordinateObject' });

export interface LatLon {
    altitude?: Meter;
    latitude: Degree;
    longitude: Degree;
}
export const LatLon: z.ZodType<LatLon> = z.object({
    altitude: Meter.optional(),
    latitude: Degree,
    longitude: Degree,
});
z.globalRegistry.add(LatLon, { id: 'LatLon' });

export type Coordinate2D = [number, number];
export const Coordinate2D: z.ZodType<Coordinate2D> = z.tuple([z.number(), z.number()]);
z.globalRegistry.add(Coordinate2D, { id: 'Coordinate2D' });

export type Coordinate3D = [number, number, number];
export const Coordinate3D: z.ZodType<Coordinate3D> = z.tuple([z.number(), z.number(), z.number()]);
z.globalRegistry.add(Coordinate3D, { id: 'Coordinate3D' });

export type Coordinate = Coordinate2D | Coordinate3D | CoordinateObject | LatLon;
export const Coordinate: z.ZodType<Coordinate> = z.union([
    CoordinateObject,
    Coordinate2D,
    Coordinate3D,
    LatLon,
]);
z.globalRegistry.add(Coordinate, { id: 'Coordinate' });
