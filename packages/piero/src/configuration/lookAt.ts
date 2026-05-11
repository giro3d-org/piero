/* eslint-disable perfectionist/sort-objects */

import { Euler, MathUtils, Vector3 } from 'three';
import z from 'zod';

import { Degree, Meter } from './units';

export interface LookAt {
    altitude: Meter;
    heading: Degree;
    latitude: Degree;

    longitude: Degree;
    tilt: Degree;
}

export const LookAt: z.ZodType<LookAt> = z.object({
    latitude: Degree,
    longitude: Degree,
    altitude: Meter,

    heading: Degree,
    tilt: Degree,
});
z.globalRegistry.add(LookAt, { id: 'LookAt' });

const FORWARD = new Vector3(0, 1, 0);

export function getLookAtTarget(origin: Vector3, lookAt: LookAt): Vector3 {
    // TODO this assumes that heading = 0 is north,
    // which is the case of most, but not all coordinate systems...
    const heading = MathUtils.degToRad(lookAt.heading);
    const tilt = MathUtils.degToRad(lookAt.tilt);

    // We don't support roll currently, because the camera controller
    // does not seem to support it as well.
    const roll = 0;

    const euler = new Euler(tilt, roll, -heading, 'ZXY');

    const target = origin.clone().addScaledVector(FORWARD.clone().applyEuler(euler), 1000);

    return target;
}
