import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';

const DEFAULT_HEIGHT = 170;

export default class FloodingPlane {
    geometry: PlaneGeometry;
    material: MeshBasicMaterial;
    object3D: Mesh<PlaneGeometry, MeshBasicMaterial>;
    private _height: number;

    constructor() {
        this.geometry = new PlaneGeometry(1, 1, 1, 1);
        this.material = new MeshBasicMaterial({ color: 0x00aaaa, transparent: true, opacity: 0.5 });
        this.object3D = new Mesh(this.geometry, this.material);
        this.object3D.renderOrder = 2;
        this.visible = false;
        this._height = DEFAULT_HEIGHT;
    }

    dispose() {
        this.object3D.removeFromParent();
        this.geometry.dispose();
        this.material.dispose();
    }

    set height(z) {
        this._height = z;
    }

    setPosition(x: number, y: number, z: number, width: number, height: number) {
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
