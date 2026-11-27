import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import CoordinateSystem from '@giro3d/giro3d/core/geographic/CoordinateSystem';
import { Euler, MathUtils, Quaternion, Vector3 } from 'three';

import type { CrsName } from '@/configuration/crs';

import { getLookAtTarget, type LookAt } from '@/configuration/lookAt';

export default class CameraPosition {
    public readonly camera: Vector3;
    public readonly focalOffset: Vector3;
    public readonly target: Vector3;

    public constructor(camera: Vector3, target: Vector3, focalOffset: Vector3) {
        this.camera = camera;
        this.target = target;
        this.focalOffset = focalOffset;
    }

    public static fromLookAt(crs: CoordinateSystem | CrsName, lookAt: LookAt): CameraPosition {
        const pos = new Coordinates(
            CoordinateSystem.epsg4326,
            lookAt.longitude,
            lookAt.latitude,
            lookAt.altitude,
        )
            .as(typeof crs === 'string' ? CoordinateSystem.get(crs) : crs)
            .toVector3();

        const target = getLookAtTarget(pos, lookAt);

        return new CameraPosition(
            new Vector3(pos.x, pos.y, pos.z),
            new Vector3(target.x, target.y, target.z),
            new Vector3(0, 0, 0),
        );
    }

    public toLookAt(crs: CoordinateSystem | CrsName): LookAt {
        const altitude = this.camera.z;
        const { latitude, longitude } = new Coordinates(
            typeof crs === 'string' ? CoordinateSystem.get(crs) : crs,
            this.camera.x,
            this.camera.y,
            altitude,
        ).as(CoordinateSystem.epsg4326);

        const direction = new Vector3().subVectors(this.target, this.camera).normalize();
        const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction);
        const euler = new Euler(0, 0, 0, 'ZXY').setFromQuaternion(quaternion, 'ZXY');

        // Note that heading rotates clockwise, so we have to invert the rotation
        const heading = MathUtils.radToDeg(-euler.z);
        const tilt = MathUtils.radToDeg(euler.x);

        return { altitude, heading, latitude, longitude, tilt };
    }
}
