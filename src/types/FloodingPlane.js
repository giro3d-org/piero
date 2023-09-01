import * as THREE from "three";

const DEFAULT_HEIGHT = 170;

export default class FloodingPlane {
    constructor() {
        this.geometry =  new THREE.PlaneGeometry(1, 1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00aaaa, transparent: true, opacity: 0.5 });
        this.object3D = new THREE.Mesh(this.geometry, this.material);
        this.object3D.renderOrder = 2;
        this.visible = false;
        this.height = DEFAULT_HEIGHT;
    }

    set height(z) {
        this._height = z;
    }

    setPosition(x, y, z, width, height) {
        this.object3D.scale.set(width, height, 1);
        this.object3D.position.set(x, y, z);
        this.object3D.updateMatrixWorld();
    }

    get height() {
        return this._height;
    }

    set visible(v) {
        this.object3D.visible = v;
    }

    get visible() {
        return this.object3D.visible;
    }
}