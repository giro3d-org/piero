import type Extent from '@giro3d/giro3d/core/geographic/Extent';
import type Instance from '@giro3d/giro3d/core/Instance';
import type { Material } from 'three';

import { GridHelper, Vector3 } from 'three';

class Grid {
    public get visible(): boolean {
        return this._grid.visible;
    }
    public set visible(v: boolean) {
        this._grid.visible = v;
        this._instance.notifyChange(this._grid);
    }

    private readonly _grid: GridHelper;

    private readonly _instance: Instance;

    public constructor(instance: Instance, extent: Extent, name: string) {
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
        void this._instance.add(this._grid);
    }
    public dispose(): void {
        this._instance.remove(this._grid);
        this._grid.geometry.dispose();
        (this._grid.material as Material).dispose();
    }
}

export default Grid;
