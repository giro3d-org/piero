import { Raycaster } from 'three';
import Instance from '@giro3d/giro3d/core/Instance';
import Measure3D from '@/giro3d/Measure3D';
import Picker from '@/services/Picker';

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
        const picked = this._picker.getFirstFeatureAt(instance, event);
        if (picked && picked.normal) {
            const n = picked.normal.clone();
            n.transformDirection(picked.object.matrixWorld);
            n.normalize();

            this._raycaster.camera = instance.view.camera;
            this._raycaster.set(picked.point, n);
            const intersects = this._raycaster
                .intersectObject(instance.scene, true)
                .filter(i => i.distance > 1e-5)
                .at(0);

            if (intersects) {
                if (!this._hoverMeasurement) {
                    this._hoverMeasurement = new Measure3D();
                    instance.threeObjects.add(this._hoverMeasurement);
                }
                this._hoverMeasurement.update(picked.point, intersects.point);
                instance.notifyChange(instance.threeObjects);
            }
        }
    }

    clean() {
        if (this._hoverMeasurement) {
            this._hoverMeasurement.removeFromParent();
            this._hoverMeasurement.dispose();
            this._hoverMeasurement = null;
        }
    }

    getLastMeasurement() {
        return this._hoverMeasurement?.clone();
    }
}
