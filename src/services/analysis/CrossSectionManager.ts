import Instance from "@giro3d/giro3d/core/Instance";
import { useAnalysisStore } from '@/stores/analysis';
import { Plane, Vector3 } from "three";

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
                        this.updateCrossSection();
                        break;
                }
            });
        });
    }

    private updateCrossSection() {
        if (this.store.isCrossSectionEnabled()) {
            const plane = new Plane(new Vector3(1, 0, 0), -842045);
            this.instance.renderer.clippingPlanes = [plane];
        } else {
            this.instance.renderer.clippingPlanes = [];
        }
        this.instance.notifyChange();
    }
}