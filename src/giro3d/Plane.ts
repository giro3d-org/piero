import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { Extent } from '@giro3d/giro3d/core/geographic';
import Instance from '@giro3d/giro3d/core/Instance';

class Plane {
    private readonly instance: Instance;
    private readonly plane: Mesh<PlaneGeometry, MeshBasicMaterial>;

    constructor(instance: Instance, extent: Extent, name: string) {
        this.instance = instance;
        const dims = extent.dimensions();
        const center = extent.center();

        this.plane = new Mesh(
            new PlaneGeometry(dims.x, dims.y, 1, 1),
            new MeshBasicMaterial({ color: 'black' }),
        );
        this.plane.name = name;
        this.plane.position.set(center.x, center.y, -101);

        this.plane.updateMatrixWorld();
        this.instance.add(this.plane);
    }

    dispose() {
        this.instance.remove(this.plane);
        this.plane.geometry.dispose();
        this.plane.material.dispose();
    }

    get visible() {
        return this.plane.visible;
    }
    set visible(v: boolean) {
        this.plane.visible = v;
        this.instance.notifyChange(this.plane);
    }
}

export default Plane;
