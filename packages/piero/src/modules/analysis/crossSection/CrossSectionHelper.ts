import { ArrowHelper, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Vector3 } from 'three';

export default class CrossSectionHelper extends Object3D {
    public constructor() {
        super();

        const plane = new Mesh(
            new PlaneGeometry(50, 100, 1, 10),
            new MeshBasicMaterial({
                color: '#6bf904',
                depthTest: false,
                depthWrite: false,
                wireframe: true,
            }),
        );
        const arrow = new ArrowHelper(new Vector3(0, 1, 0), new Vector3(0, 0, 0), 200);
        plane.renderOrder = 999;
        plane.rotateY(Math.PI / 2);
        this.add(plane);
        this.add(arrow);

        this.updateMatrixWorld(true);
    }
}
