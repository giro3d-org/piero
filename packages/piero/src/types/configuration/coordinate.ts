import Giro3DCoordinates from '@giro3d/giro3d/core/geographic/Coordinates';
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
