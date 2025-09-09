import Measure3D from '@/giro3d/Measure3D';
import type Picker from '@/services/Picker';
import type Instance from '@giro3d/giro3d/core/Instance';
import { isShape } from '@giro3d/giro3d/entities/Shape';
import { Raycaster } from 'three';

export default class MeasureTool {
    private readonly _picker: Picker;
    private readonly _raycaster: Raycaster;
    private _hoverMeasurement: Measure3D | null;

    constructor(picker: Picker) {
        this._picker = picker;

        this._raycaster = new Raycaster();
        this._hoverMeasurement = null;
    }

    dispose() {
        this.clean();
    }

    measure(instance: Instance, event: MouseEvent) {
        const picked = this._picker.getFirstFeatureAt(instance, event, 0, o => !isShape(o))?.at(0);

        if (picked && picked.normal) {
            const n = picked.normal.clone();
            n.transformDirection(picked.object.matrixWorld);
            n.normalize();

            this._raycaster.camera = instance.view.camera;
            this._raycaster.set(picked.point, n);

            const intersects = this._raycaster
                .intersectObject(instance.scene, true)
                .filter(
                    i =>
                        i.distance > 1e-5 &&
                        i.object.userData.parentEntity !== this._hoverMeasurement,
                )
                .at(0);

            if (intersects) {
                if (!this._hoverMeasurement) {
                    this._hoverMeasurement = new Measure3D();
                    instance.add(this._hoverMeasurement);
                }
                this._hoverMeasurement.visible = true;
                this._hoverMeasurement.setPoints([picked.point, intersects.point]);
                instance.notifyChange(this._hoverMeasurement);
            }
        }
    }

    clean() {
        if (this._hoverMeasurement) {
            this._hoverMeasurement.instance.remove(this._hoverMeasurement);
            this._hoverMeasurement = null;
        }
    }

    getLastMeasurement() {
        return this._hoverMeasurement?.clone();
    }
}
