import Instance from "@giro3d/giro3d/core/Instance";
import { useAnalysisStore } from '@/stores/analysis';
import { MathUtils, Plane, Vector3 } from "three";

export default class CrossSectionManager {
    private readonly instance: Instance;
    private readonly store = useAnalysisStore();

    constructor(instance: Instance) {
        this.instance = instance;
        this.store.$onAction(({
            name,
            after
        }) => {
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
    }

    private updateCrossSection() {
        if (this.store.isCrossSectionEnabled()) {
            const radians = MathUtils.DEG2RAD * this.store.crossSectionOrientation;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            const normal = new Vector3(cos, sin, 0);

            const distance = new Plane(normal, 0).distanceToPoint(this.store.crossSectionCenter);
            const plane = new Plane(normal, -distance);
            this.instance.renderer.clippingPlanes = [plane];
        } else {
            this.instance.renderer.clippingPlanes = [];
        }
        this.instance.notifyChange();
    }
}