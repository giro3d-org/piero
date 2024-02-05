import { CircleGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2';

const _axe = new Vector3();
const _negatedAxe = new Vector3();
const _offset = new Vector3();
const _translatedTo = new Vector3();

class Measure3D extends Group {
    private _length: number;
    private _from: Vector3;
    private _to: Vector3;

    private _label: CSS2DObject;
    private _circleFrom: Mesh;
    private _circleTo: Mesh;
    private _line: Line2;
    private _lineMaterial: LineMaterial;
    private _lineGeometry: LineGeometry;

    public readonly isMeasure3D = true;
    public readonly isPickableFeatures = true;

    get from() {
        return this._from;
    }
    get to() {
        return this._to;
    }
    get length() {
        return this._length;
    }

    constructor() {
        super();

        this._length = NaN;
        this._from = new Vector3();
        this._to = new Vector3();

        // Create label (we'll fill its content later)
        const text = document.createElement('div');
        text.style.color = '#ECE100';
        text.style.padding = '0.5em';
        text.style.backgroundColor = '#080808';
        text.style.pointerEvents = 'none';
        this._label = new CSS2DObject(text);

        // Create circle meshes (we'll position them later)
        const circleGeom = new CircleGeometry(1);
        const circleMaterial = new MeshBasicMaterial({ color: 0xece100 });
        this._circleFrom = new Mesh(circleGeom, circleMaterial);
        this._circleTo = new Mesh(circleGeom, circleMaterial);

        // Create the fatline (we'll position it later)
        this._lineMaterial = new LineMaterial({
            color: 0xece100,
            linewidth: 0.001,
            worldUnits: false,
        });
        this._lineMaterial.transparent = false;
        this._lineGeometry = new LineGeometry();
        this._line = new Line2(this._lineGeometry, this._lineMaterial);

        this.add(this._circleFrom);
        this.add(this._circleTo);
        this.add(this._label);
        this.add(this._line);
    }

    update(from: Vector3, to: Vector3) {
        this._from.copy(from);
        this._to.copy(to);

        // Length of the measurement in CRS unit
        this._length = from.distanceTo(to);

        // Normalized axe of the line
        _axe.subVectors(to, from).normalize();
        _negatedAxe.copy(_axe).negate();

        // We position the circles with a small offset to avoid Z-fighting
        _offset.copy(_axe).multiplyScalar(this._length / 10000);

        const scale = Math.min(this._length * 0.01, 0.2);
        this._circleFrom.position.set(0, 0, 0);
        this._circleFrom.lookAt(_axe);
        this._circleFrom.position.copy(from).add(_offset);
        this._circleFrom.scale.set(scale, scale, scale);
        this._circleFrom.updateMatrixWorld();

        this._circleTo.position.set(0, 0, 0);
        this._circleTo.lookAt(_negatedAxe);
        this._circleTo.position.copy(to).sub(_offset);
        this._circleTo.scale.set(scale, scale, scale);
        this._circleTo.updateMatrixWorld();

        // And we position the label at 10% of the line
        _axe.multiplyScalar(this._length / 10).add(from);

        this._label.position.copy(_axe);
        this._label.updateMatrixWorld();
        this._label.element.innerText = `${this._length.toFixed(2)}m`;

        // And finally we update the line with local-ish coordinates
        // for correct rendering
        _translatedTo.subVectors(to, from);
        this._lineGeometry.setPositions([
            0,
            0,
            0,
            _translatedTo.x,
            _translatedTo.y,
            _translatedTo.z,
        ]);
        this._line.position.copy(from);
        this._line.updateMatrix();
        this._line.updateMatrixWorld();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    copy(source: this, recursive?: boolean): this {
        this.update(source._from, source._to);
        return this;
    }

    dispose() {
        this._circleFrom.geometry.dispose();
        this._circleTo.geometry.dispose();
        this._lineGeometry.dispose();
        (this._circleFrom.material as MeshBasicMaterial).dispose();
        (this._circleTo.material as MeshBasicMaterial).dispose();
        this._lineMaterial.dispose();
    }

    removeFromParent(): this {
        this._label.element.remove();
        return super.removeFromParent();
    }

    static isMeasure3D = (obj: any): obj is Measure3D => obj?.isMeasure3D;
}

export default Measure3D;
