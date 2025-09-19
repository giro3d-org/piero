import type { Vector3 } from 'three';

import { BufferGeometry, LineBasicMaterial, LineSegments } from 'three';

export default class Viewbox {
    public geometry: BufferGeometry;
    public object3D: LineSegments<BufferGeometry, LineBasicMaterial>;
    public constructor() {
        this.geometry = new BufferGeometry();
        this.object3D = new LineSegments(this.geometry, new LineBasicMaterial({ color: 0xff0000 }));
        this.object3D.position.set(0, 0, 1);
        this.object3D.updateMatrixWorld();
    }

    public setCorners(ul: Vector3, ur: Vector3, lr: Vector3, ll: Vector3): void {
        this.geometry.setFromPoints([ul, ur, ur, lr, lr, ll, ll, ul]);
    }
}
