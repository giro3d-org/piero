import { GridHelper, Material, Vector3 } from 'three';
import { Extent } from '@giro3d/giro3d/core/geographic';
import Instance from '@giro3d/giro3d/core/Instance';

class Grid {
    private readonly instance: Instance;
    private readonly grid: GridHelper;

    constructor(instance: Instance, extent: Extent, name: string) {
        this.instance = instance;
        const dims = extent.dimensions();
        const center = extent.center();

        this.grid = new GridHelper(1, 100);
        this.grid.name = name;
        this.grid.scale.set(dims.x, 1, dims.y);
        this.grid.visible = true;
        this.grid.position.set(center.x, center.y, -100);
        this.grid.rotateOnAxis(new Vector3(1, 0, 0), Math.PI / 2);
        const gridMat = this.grid.material as Material;
        gridMat.opacity = 0.5;
        gridMat.transparent = true;

        this.grid.updateMatrixWorld();
        this.instance.add(this.grid);
    }

    dispose() {
        this.instance.remove(this.grid);
        this.grid.geometry.dispose();
        (this.grid.material as Material).dispose();
    }

    get visible() {
        return this.grid.visible;
    }
    set visible(v: boolean) {
        this.grid.visible = v;
        this.instance.notifyChange(this.grid);
    }
}

export default Grid;
