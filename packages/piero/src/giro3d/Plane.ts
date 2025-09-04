import type Instance from '@giro3d/giro3d/core/Instance';
import type Extent from '@giro3d/giro3d/core/geographic/Extent';
import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';

class Plane {
    private readonly _instance: Instance;
    private readonly _plane: Mesh<PlaneGeometry, MeshBasicMaterial>;

    constructor(instance: Instance, extent: Extent, name: string) {
        this._instance = instance;
        const dims = extent.dimensions();
        const center = extent.center();

        this._plane = new Mesh(
            new PlaneGeometry(dims.x, dims.y, 1, 1),
            new MeshBasicMaterial({ color: 'black' }),
        );
        this._plane.name = name;
        this._plane.position.set(center.x, center.y, -101);

        this._plane.updateMatrixWorld();
        this._instance.add(this._plane);
    }

    dispose() {
        this._instance.remove(this._plane);
        this._plane.geometry.dispose();
        this._plane.material.dispose();
    }

    get visible() {
        return this._plane.visible;
    }
    set visible(v: boolean) {
        this._plane.visible = v;
        this._instance.notifyChange(this._plane);
    }
}

export default Plane;
