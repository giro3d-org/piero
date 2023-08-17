import FloodingPlane from "../../types/FloodingPlane";
import BasemapController from "./BasemapController";
import Giro3DController from "./Giro3DController";

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
    if (!plane) {
        plane = new FloodingPlane();
        instance = Giro3DController.getMainInstance();
        instance.add(plane.object3D);
    }
    const extent = BasemapController.getExtent();
    const center = extent.center();
    const dims = extent.dimensions();
    plane.setPosition(center.x(), center.y(), plane.height, dims.x, dims.y);
    instance.notifyChange();
}

export default {
    getPlane,
    updatePlane,
}