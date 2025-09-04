import Download from '@/utils/Download';
import { EventDispatcher, Vector3 } from 'three';
import CameraPosition from './CameraPosition';

type BookmarkJson = {
    camera: [number, number, number];
    target: [number, number, number];
    focalOffset: [number, number, number];
};

export type SerializedBookmark = {
    title: string;
    url: string;
};

type BookmarkEventMap = {
    delete: {
        /** empty */
    };
    goto: {
        /** empty */
    };
};

export default class Bookmark extends EventDispatcher<BookmarkEventMap> {
    readonly name: string;
    readonly camera: CameraPosition;

    constructor(name: string, camera: CameraPosition) {
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
        const base = Download.getBaseUrl() + '?';
        const cam = this.camera;
        const json: BookmarkJson = {
            camera: [cam.camera.x, cam.camera.y, cam.camera.z],
            target: [cam.target.x, cam.target.y, cam.target.z],
            focalOffset: [cam.focalOffset.x, cam.focalOffset.y, cam.focalOffset.z],
        };

        const url = new URL(base);
        const params = url.searchParams;

        params.set('tour', 'none');
        params.set('view', JSON.stringify(json));

        return url;
    }

    static new(name: string, urlString: string): Bookmark {
        const url = new URL(urlString);
        const view = url.searchParams.get('view');
        if (view === null) {
            throw new Error('Could not deserialize bookmark');
        }
        const json: BookmarkJson = JSON.parse(view);

        const camera = new Vector3(json.camera[0], json.camera[1], json.camera[2]);
        const target = new Vector3(json.target[0], json.target[1], json.target[2]);
        const focalOffset = new Vector3(
            json.focalOffset[0],
            json.focalOffset[1],
            json.focalOffset[2],
        );

        const cameraPosition = new CameraPosition(camera, target, focalOffset);

        return new Bookmark(name, cameraPosition);
    }
}
