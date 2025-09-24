import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';

export default class FloodingPlaneObject {
    public geometry: PlaneGeometry;
    public material: MeshBasicMaterial;
    public object3D: Mesh<PlaneGeometry, MeshBasicMaterial>;
    public set height(z: number) {
        this._height = z;
    }

    public get height(): number {
        return this._height;
    }

    public set visible(v: boolean) {
        this.object3D.visible = v;
    }

    public get visible(): boolean {
        return this.object3D.visible;
    }

    private _height: number;

    public constructor() {
        this.geometry = new PlaneGeometry(1, 1, 1, 1);
        this.material = new MeshBasicMaterial({ color: 0x00aaaa, opacity: 0.5, transparent: true });
        this.object3D = new Mesh(this.geometry, this.material);
        this.object3D.renderOrder = 2;
        this.visible = false;
        this._height = 0;
    }

    public dispose(): void {
        this.object3D.removeFromParent();
        this.geometry.dispose();
        this.material.dispose();
    }

    public setPosition(x: number, y: number, z: number, width: number, height: number): void {
        this.object3D.scale.set(width, height, 1);
        this.object3D.position.set(x, y, z);
        this.object3D.updateMatrixWorld();
    }
}
