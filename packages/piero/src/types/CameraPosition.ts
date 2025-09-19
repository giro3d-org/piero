import type { Vector3 } from 'three';

export default class CameraPosition {
    public readonly camera: Vector3;
    public readonly focalOffset: Vector3;
    public readonly target: Vector3;

    public constructor(camera: Vector3, target: Vector3, focalOffset: Vector3) {
        this.camera = camera;
        this.target = target;
        this.focalOffset = focalOffset;
    }
}
