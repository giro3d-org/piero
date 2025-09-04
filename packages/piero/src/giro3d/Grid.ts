import type Instance from '@giro3d/giro3d/core/Instance';
import type Extent from '@giro3d/giro3d/core/geographic/Extent';
import type { Material } from 'three';
import { GridHelper, Vector3 } from 'three';

class Grid {
    private readonly _instance: Instance;
    private readonly _grid: GridHelper;

    constructor(instance: Instance, extent: Extent, name: string) {
        this._instance = instance;
        const dims = extent.dimensions();
        const center = extent.center();

        this._grid = new GridHelper(1, 100);
        this._grid.name = name;
        this._grid.scale.set(dims.x, 1, dims.y);
        this._grid.visible = true;
        this._grid.position.set(center.x, center.y, -100);
        this._grid.rotateOnAxis(new Vector3(1, 0, 0), Math.PI / 2);
        const gridMat = this._grid.material as Material;
        gridMat.opacity = 0.5;
        gridMat.transparent = true;

        this._grid.updateMatrixWorld();
        this._instance.add(this._grid);
    }

    dispose() {
        this._instance.remove(this._grid);
        this._grid.geometry.dispose();
        (this._grid.material as Material).dispose();
    }

    get visible() {
        return this._grid.visible;
    }
    set visible(v: boolean) {
        this._grid.visible = v;
        this._instance.notifyChange(this._grid);
    }
}

export default Grid;
