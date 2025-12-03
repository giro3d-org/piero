import { AxesHelper, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry } from 'three';

export default class CrossSectionHelper extends Object3D {
    private _axes: AxesHelper;

    public constructor() {
        super();

        this._axes = new AxesHelper(100);
        this.add(this._axes);
        const plane = new Mesh(
            new PlaneGeometry(50, 100, 5, 10),
            new MeshBasicMaterial({
                color: '#6bf904',
                depthTest: false,
                depthWrite: false,
                wireframe: true,
            }),
        );
        plane.renderOrder = 999;
        plane.rotateY(Math.PI / 2);
        this.add(plane);

        // To avoid being clipped by the clipping plane itself
        plane.translateZ(1);
        this._axes.translateZ(1);

        this.updateMatrixWorld(true);
    }
}
