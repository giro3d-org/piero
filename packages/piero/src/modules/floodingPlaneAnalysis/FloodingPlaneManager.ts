import { Vector3 } from 'three';

import type { PieroContext } from '@/context';

import FloodingPlaneObject from './FloodingPlaneObject';
import { useFloodingPlaneStore } from './store';

export default class FloodingPlaneManager {
    private readonly _context: PieroContext;
    private _plane: FloodingPlaneObject | null;
    private readonly _store = useFloodingPlaneStore();

    public constructor(context: PieroContext) {
        this._context = context;
        this._plane = null;

        context.events.addEventListener('ready', () => {
            this._store.$onAction(({ after, name }) => {
                after(() => {
                    switch (name) {
                        case 'setEnabled':
                            void this.updatePlane();
                            break;
                        case 'setHeight':
                            void this.updatePlane();
                            break;
                    }
                });
            });
        });
    }

    public dispose(): void {
        if (this._plane) {
            this._context.view.getInstance().remove(this._plane.object3D);
            this._plane.dispose();
        }
    }

    private async updatePlane(): Promise<void> {
        if (!this._plane) {
            this._plane = new FloodingPlaneObject();
            await this._context.view.getInstance().add(this._plane.object3D);
        }
        const extent = this._context.view.getBoundingBox();
        const center = extent.getCenter(new Vector3());
        const dims = extent.getSize(new Vector3());

        this._plane.visible = this._store.enable;
        this._plane.setPosition(center.x, center.y, this._store.getHeight(), dims.x, dims.y);
        this._context.view.getInstance().notifyChange();
    }
}
