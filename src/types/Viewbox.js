import * as THREE from 'three'

export default class Viewbox {
    constructor() {
        this.geometry = new THREE.BufferGeometry();
        this.object3D = new THREE.LineSegments(
            this.geometry,
            new THREE.LineBasicMaterial({ color: 0xff0000 }),
        );
        this.object3D.position.set(0, 0, 1);
        this.object3D.updateMatrixWorld();
    }

    /**
     * @param {THREE.Vector3} ul
     * @param {THREE.Vector3} ur
     * @param {THREE.Vector3} lr
     * @param {THREE.Vector3} ll
     */
    setCorners(ul, ur, lr, ll) {
        this.geometry.setFromPoints([
            ul, ur,
            ur, lr,
            lr, ll,
            ll, ul,
        ]);
    }
}