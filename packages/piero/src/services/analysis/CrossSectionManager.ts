import { useAnalysisStore } from '@/stores/analysis';
import { useDatasetStore } from '@/stores/datasets';
import type Instance from '@giro3d/giro3d/core/Instance';
import { MathUtils, Plane, Vector3 } from 'three';

export default class CrossSectionManager {
    private readonly _instance: Instance;
    private readonly _store = useAnalysisStore();
    private readonly _datasetStore = useDatasetStore();

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
        const clippingPlanes = [];

        if (this._store.isCrossSectionEnabled()) {
            const radians = MathUtils.DEG2RAD * this._store.crossSectionOrientation;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            const normal = new Vector3(cos, sin, 0);

            const distance = new Plane(normal, 0).distanceToPoint(this._store.crossSectionCenter);
            const plane = new Plane(normal, -distance);
            clippingPlanes.push(plane);
        }

        this._instance.renderer.clippingPlanes = clippingPlanes;
        for (const o of this._datasetStore.getDatasets()) {
            const entity = this._datasetStore.getEntity(o);
            if (entity) {
                // Make sure entities know clipping planes are updated so
                // they can optimize their rendering
                // See https://gitlab.com/giro3d/piero/-/merge_requests/82
                entity.dispatchEvent({
                    type: 'clippingPlanes-property-changed',
                    clippingPlanes: clippingPlanes,
                });
            }
        }

        this._instance.notifyChange();
    }
}
