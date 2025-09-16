import type LayerManager from '@/services/LayerManager';
import { useAnalysisStore } from '@/stores/analysis';
import FloodingPlane from '@/types/FloodingPlane';
import type Instance from '@giro3d/giro3d/core/Instance';

export default class FloodingPlaneManager {
    private readonly _instance: Instance;
    private readonly _layerManager: LayerManager;
    private readonly _store = useAnalysisStore();
    private _plane: FloodingPlane | null;

    constructor(instance: Instance, layerManager: LayerManager) {
        this._instance = instance;
        this._layerManager = layerManager;
        this._plane = null;

        this._store.$onAction(({ name, after }) => {
            after(() => {
                switch (name) {
                    case 'enableFloodingPlane':
                        this.updatePlane();
                        break;
                    case 'setFloodingPlaneHeight':
                        this.updatePlane();
                        break;
                }
            });
        });
    }

    dispose() {
        if (this._plane) {
            this._instance.remove(this._plane.object3D);
            this._plane.dispose();
        }
    }

    private updatePlane() {
        if (!this._plane) {
            this._plane = new FloodingPlane();
            this._instance.add(this._plane.object3D);
        }
        const extent = this._layerManager.extent;
        const center = extent.centerAsVector2();
        const dims = extent.dimensions();

        this._plane.visible = this._store.isFloodingPlaneEnabled();
        this._plane.setPosition(
            center.x,
            center.y,
            this._store.floodingPlaneHeight,
            dims.x,
            dims.y,
        );
        this._instance.notifyChange();
    }
}
