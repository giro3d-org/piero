import type Instance from '@giro3d/giro3d/core/Instance';

import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import { isEntity3D } from '@giro3d/giro3d/entities/Entity3D';
import { MathUtils, Plane, Vector3 } from 'three';

import type { PieroContext } from '@/context';

import CrossSectionHelper from './CrossSectionHelper';
import { useCrossSectionStore } from './store';

export default class CrossSectionManager {
    private _clippingPlanes: Plane[] | null = null;
    private _helper?: CrossSectionHelper;
    private _instance?: Instance;
    private readonly _store = useCrossSectionStore();

    public constructor(private readonly context: PieroContext) {
        context.events.addEventListener('ready', () => {
            this._instance = context.view.getInstance();
            const defaultCrs = context.configuration.default_crs;
            const config = context.configuration.analysis.cross_section;

            this._store.setCursorManager(context.view.getSceneCursorManager());
            this._store.setInstance(context.view.getInstance());
            this._store.setOrientation(config.orientation);
            const pivot = config.pivot;
            const pivotLocal = new Coordinates(pivot.crs ?? defaultCrs, pivot.x, pivot.y, 0).as(
                defaultCrs,
            );
            this._store.setCenter(pivotLocal.toVector3());

            this._instance.addEventListener('entity-added', this.updateCrossSection.bind(this));

            this._store.$onAction(({ after, name }) => {
                after(() => {
                    switch (name) {
                        case 'setCenter':
                        case 'setEnabled':
                        case 'setOrientation':
                        case 'setShowHelper':
                            this.updateCrossSection();
                            this.updateHelper();
                            this.showHelper(this._store.showHelper);
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

    private showHelper(show: boolean): void {
        if (show && this._helper == null && this._instance) {
            this._helper = new CrossSectionHelper();
            this._instance.add(this._helper).catch(console.error);
        }
        if (this._helper) {
            this._helper.visible = show;
        }

        this.updateHelper();
    }

    private updateCrossSection(): void {
        if (this._store.enable) {
            const clippingPlanes = [];
            const radians = MathUtils.DEG2RAD * this._store.orientation;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            const normal = new Vector3(cos, sin, 0);

            const distance = new Plane(normal, 0).distanceToPoint(this._store.center);
            const plane = new Plane(normal, -distance);
            clippingPlanes.push(plane);
            this._clippingPlanes = clippingPlanes;
        } else {
            this._clippingPlanes = null;
        }

        this.updateEntities();
    }

    private updateEntities(): void {
        const instance = this.context.view.getInstance();

        for (const entity of instance.getEntities()) {
            if (isEntity3D(entity)) {
                entity.clippingPlanes = this._clippingPlanes;
            }
        }

        instance.notifyChange();
    }

    private updateHelper(): void {
        this._helper?.position.copy(this._store.center);
        this._helper?.updateMatrixWorld(true);
        this._helper?.setRotationFromAxisAngle(
            new Vector3(0, 0, 1),
            MathUtils.degToRad(this._store.orientation),
        );
        this._instance?.notifyChange();
    }
}
