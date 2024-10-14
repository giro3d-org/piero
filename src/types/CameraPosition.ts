import type { Vector3 } from 'three';

export default class CameraPosition {
    readonly camera: Vector3;
    readonly target: Vector3;
    readonly focalOffset: Vector3;

    constructor(camera: Vector3, target: Vector3, focalOffset: Vector3) {
        this.camera = camera;
        this.target = target;
        this.focalOffset = focalOffset;
    }
}
