import type { Vector3 } from 'three';

import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

import type { CrsName } from '@/configuration/crs';
import type { LookAt } from '@/configuration/lookAt';

export default class CameraPosition {
    public readonly camera: Vector3;
    public readonly focalOffset: Vector3;
    public readonly target: Vector3;

    public constructor(camera: Vector3, target: Vector3, focalOffset: Vector3) {
        this.camera = camera;
        this.target = target;
        this.focalOffset = focalOffset;
    }

    public toLookAt(crs: CrsName): LookAt {
        const altitude = this.camera.z;
        const { latitude, longitude } = new Coordinates(
            crs,
            this.camera.x,
            this.camera.y,
            altitude,
        ).as('EPSG:4326');

        // TODO check formulas
        const heading = Math.atan2(this.target.x - this.camera.x, this.target.y - this.camera.y);
        const tilt = Math.atan2(
            Math.sqrt((this.target.x - this.camera.x) ** 2 + (this.target.y - this.camera.y) ** 2),
            this.target.z - this.camera.z,
        );

        return { altitude, heading, latitude, longitude, tilt };
    }
}
