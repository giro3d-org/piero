import type CameraController from '@/services/CameraController';

export default interface ViewApi {
    getCameraController(): CameraController;
}

/** @internal */
export class ViewApiImpl implements ViewApi {
    private readonly _cameraController: CameraController;

    constructor(params: { camera: CameraController }) {
        this._cameraController = params.camera;
    }

    getCameraController(): CameraController {
        return this._cameraController;
    }
}
