import { EventDispatcher } from "three";
import CameraPosition from "./CameraPosition";

export default class Bookmark extends EventDispatcher {
    readonly name: string;
    readonly camera: CameraPosition;

    constructor(name: string, camera?: CameraPosition)  {
        super();
        this.name = name;
        this.camera = camera;
    }

    delete() {
        this.dispatchEvent({ type: 'delete' });
    }

    goTo() {
        this.dispatchEvent({ type: 'goto' });
    }

    getUrl() {
        const base = 'https://giro3d.gitlab.io/giro3d-sample-application/?';
        const cam = this.camera;
        const json = {
            camera: [cam.camera.x, cam.camera.y, cam.camera.z],
            target: [cam.target.x, cam.target.y, cam.target.z],
            focalOffset: [cam.focalOffset.x, cam.focalOffset.y, cam.focalOffset.z]
        };

        const url = new URL(base);
        const params = url.searchParams;

        params.set('tour', 'none');
        params.set('view', JSON.stringify(json));

        return url;
    }
}