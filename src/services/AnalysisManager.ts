import FloodingPlaneManager from '@/services/analysis/FloodingPlaneManager';
import type Instance from '@giro3d/giro3d/core/Instance';
import type LayerManager from './LayerManager';
import ClippingBoxManager from './analysis/ClippingBoxManager';
import CrossSectionManager from './analysis/CrossSectionManager';

export default class AnalysisManager {
    private readonly _instance: Instance;
    private readonly _floodingPlaneManager: FloodingPlaneManager;
    private readonly _crossSectionManager: CrossSectionManager;
    private readonly _clippingBoxManager: ClippingBoxManager;

    constructor(instance: Instance, layerManager: LayerManager) {
        this._instance = instance;
        this._floodingPlaneManager = new FloodingPlaneManager(instance, layerManager);
        this._crossSectionManager = new CrossSectionManager(instance);
        this._clippingBoxManager = new ClippingBoxManager(instance);
    }

    dispose() {
        this._clippingBoxManager.dispose();
        this._crossSectionManager.dispose();
        this._floodingPlaneManager.dispose();
    }
}
