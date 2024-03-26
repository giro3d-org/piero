import Instance from '@giro3d/giro3d/core/Instance';
import { useAnalysisStore } from '@/stores/analysis';
import { MathUtils, Plane, Vector3 } from 'three';

export default class CrossSectionManager {
    private readonly _instance: Instance;
    private readonly _store = useAnalysisStore();

    constructor(instance: Instance) {
        this._instance = instance;
        this._store.$onAction(({ name, after }) => {
            after(() => {
                switch (name) {
                    case 'enableCrossSection':
                    case 'setCrossSectionOrientation':
                    case 'setCrossSectionCenter':
                        this.updateCrossSection();
                        break;
                }
            });
        });

        this.updateCrossSection();
    }

    dispose() {
        // Nothing to do
    }

    private updateCrossSection() {
        if (this._store.isCrossSectionEnabled()) {
            const radians = MathUtils.DEG2RAD * this._store.crossSectionOrientation;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            const normal = new Vector3(cos, sin, 0);

            const distance = new Plane(normal, 0).distanceToPoint(this._store.crossSectionCenter);
            const plane = new Plane(normal, -distance);
            this._instance.renderer.clippingPlanes = [plane];
        } else {
            this._instance.renderer.clippingPlanes = [];
        }
        this._instance.notifyChange();
    }
}
