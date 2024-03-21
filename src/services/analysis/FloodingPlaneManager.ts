import Instance from '@giro3d/giro3d/core/Instance';
import FloodingPlane from '@/types/FloodingPlane';
import LayerManager from '@/services/LayerManager';
import { useAnalysisStore } from '@/stores/analysis';

export default class FloodingPlaneManager {
    private readonly instance: Instance;
    private readonly layerManager: LayerManager;
    private readonly store = useAnalysisStore();
    private plane: FloodingPlane | null;

    constructor(instance: Instance, layerManager: LayerManager) {
        this.instance = instance;
        this.layerManager = layerManager;
        this.plane = null;

        this.store.$onAction(({ name, after }) => {
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
        if (this.plane) {
            this.instance.remove(this.plane.object3D);
            this.plane.dispose();
        }
    }

    private updatePlane() {
        if (!this.plane) {
            this.plane = new FloodingPlane();
            this.instance.add(this.plane.object3D);
        }
        const extent = this.layerManager.extent;
        const center = extent.centerAsVector2();
        const dims = extent.dimensions();

        this.plane.visible = this.store.isFloodingPlaneEnabled();
        this.plane.setPosition(center.x, center.y, this.store.floodingPlaneHeight, dims.x, dims.y);
        this.instance.notifyChange();
    }
}
