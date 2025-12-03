import type Instance from '@giro3d/giro3d/core/Instance';

import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import { isEntity3D } from '@giro3d/giro3d/entities/Entity3D';
import { MathUtils, Plane, Vector3 } from 'three';

import type { PieroContext } from '@/context';

import { useCrossSectionStore } from './store';

export default class CrossSectionManager {
    private _instance?: Instance;
    private readonly _store = useCrossSectionStore();

    public constructor(private readonly context: PieroContext) {
        context.events.addEventListener('ready', () => {
            this._instance = context.view.getInstance();
            const defaultCrs = context.configuration.default_crs;
            const config = context.configuration.analysis.cross_section;

            this._store.setInstance(context.view.getInstance());
            this._store.setOrientation(config.orientation);
            const pivot = config.pivot;
            const pivotLocal = new Coordinates(pivot.crs ?? defaultCrs, pivot.x, pivot.y, 0).as(
                defaultCrs,
            );
            this._store.setCenter(pivotLocal.toVector3());

            this._store.$onAction(({ after, name }) => {
                after(() => {
                    switch (name) {
                        case 'setCenter':
                        case 'setEnabled':
                        case 'setOrientation':
                            this.updateCrossSection();
                            break;
                    }
                });
            });

            this.updateCrossSection();
        });
    }

    public dispose(): void {
        // Nothing to do
    }

    private updateCrossSection(): void {
        const clippingPlanes = [];

        if (this._store.enable) {
            const radians = MathUtils.DEG2RAD * this._store.orientation;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            const normal = new Vector3(cos, sin, 0);

            const distance = new Plane(normal, 0).distanceToPoint(this._store.center);
            const plane = new Plane(normal, -distance);
            clippingPlanes.push(plane);
        }

        const instance = this.context.view.getInstance();

        instance.renderer.clippingPlanes = clippingPlanes;
        for (const entity of this.context.view.getInstance().getEntities()) {
            if (isEntity3D(entity)) {
                // Make sure entities know clipping planes are updated so
                // they can optimize their rendering
                // See https://gitlab.com/giro3d/piero/-/merge_requests/82
                entity.dispatchEvent({
                    clippingPlanes: clippingPlanes,
                    type: 'clippingPlanes-property-changed',
                });
            }
        }

        instance.notifyChange();
    }
}
