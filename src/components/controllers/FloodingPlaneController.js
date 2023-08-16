import FloodingPlane from "../../types/FloodingPlane";
import BasemapController from "./BasemapController";
import Giro3DController from "./Giro3DController";

/** @type {FloodingPlane} */
let plane;
let instance;

function updatePlane(visible, height) {
    if (!plane) {
        plane = new FloodingPlane();
        instance = Giro3DController.getMainInstance();
        instance.add(plane.object3D);
    }
    const z = height;
    const extent = BasemapController.getExtent();
    const center = extent.center();
    const dims = extent.dimensions();
    plane.setPosition(center.x(), center.y(), z, dims.x, dims.y);
    plane.visible = visible;
    instance.notifyChange();
}

export default {
    updatePlane,
}