import * as THREE from 'three';
import Instance from "@giro3d/giro3d/core/Instance";
import FloodingPlane from "../../types/FloodingPlane";
import MainController from "./MainController";

let plane: FloodingPlane;
let instance: Instance;

function getPlane() {
    if (!plane) {
        plane = new FloodingPlane();
        instance = MainController.get().mainInstance;
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
    const center = extent.center(new THREE.Vector2()) as THREE.Vector2;
    const dims = extent.dimensions() as THREE.Vector2;

    plane.setPosition(center.x, center.y, plane.height, dims.x, dims.y);
    instance.notifyChange();
}

export default {
    getPlane,
    updatePlane,
}