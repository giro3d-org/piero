import Instance from "@giro3d/giro3d/core/Instance";
import FloodingPlaneManager from "@/services/analysis/FloodingPlaneManager";
import LayerManager from "./LayerManager";

export default class AnalysisManager {
    private readonly instance: Instance;
    private readonly floodingPlaneManager: FloodingPlaneManager;

    constructor(instance: Instance, layerManager: LayerManager) {
        this.instance = instance;
        this.floodingPlaneManager = new FloodingPlaneManager(instance, layerManager);
    }
}