import * as THREE from "three";

export default class FloodingPlane {
    constructor() {
        this.geometry =  new THREE.PlaneGeometry(1, 1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00aaaa });
        this.object3D = new THREE.Mesh(this.geometry, this.material);
    }

    set height(z) {
        this.object3D.position.setZ(z);
        this.object3D.updateMatrixWorld();
    }

    setPosition(x, y, z, width, height) {
        this.object3D.scale.set(width, height, 1);
        this.object3D.position.set(x, y, z);
        this.object3D.updateMatrixWorld();
    }

    get height() {
        return this.object3D.position.z;
    }

    set visible(v) {
        this.object3D.visible = v;
    }

    get visible() {
        return this.object3D.visible;
    }
}