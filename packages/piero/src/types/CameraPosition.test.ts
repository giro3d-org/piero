import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem';
import { describe, expect, it } from 'vitest';

import type { LookAt } from '@/configuration/lookAt';

import CameraPosition from './CameraPosition';

describe('fromLookAt/toLookAt', () => {
    it('round trips', () => {
        const lookAt: LookAt = {
            altitude: 23_000,
            heading: 34.23,
            latitude: 23.123,
            longitude: 43.092,
            tilt: 67.91,
        };

        const crs = CoordinateSystem.epsg3857;

        const camPos = CameraPosition.fromLookAt(crs, lookAt);

        const lookAt2 = camPos.toLookAt(crs);

        expect(lookAt.altitude).toBeCloseTo(lookAt2.altitude);
        expect(lookAt.longitude).toBeCloseTo(lookAt2.longitude);
        expect(lookAt.latitude).toBeCloseTo(lookAt2.latitude);
        expect(lookAt.heading).toBeCloseTo(lookAt2.heading);
        expect(lookAt.tilt).toBeCloseTo(lookAt2.tilt);
    });
});
