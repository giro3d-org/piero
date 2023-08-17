import FloodingPlane from "../../types/FloodingPlane";
import Giro3DController from "./Giro3DController";
import MainController from "./MainController";

/** @type {FloodingPlane} */
let plane;
let instance;

function getPlane() {
    if (!plane) {
        plane = new FloodingPlane();
        instance = Giro3DController.getMainInstance();
        instance.add(plane.object3D);
    }

    return plane;
}

function updatePlane() {
    const main = MainController.get();
    if (!plane) {
        plane = new FloodingPlane();
        instance = main.mainInstance;
        instance.add(plane.object3D);
    }
    const extent = main.layerManager.extent;
    const center = extent.center();
    const dims = extent.dimensions();
    plane.setPosition(center.x(), center.y(), plane.height, dims.x, dims.y);
    instance.notifyChange();
}

export default {
    getPlane,
    updatePlane,
}