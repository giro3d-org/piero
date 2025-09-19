import type CameraController from '@/services/CameraController';

/** @internal */
export class ViewApiImpl implements ViewApi {
    private readonly _cameraController: CameraController;

    public constructor(params: { camera: CameraController }) {
        this._cameraController = params.camera;
    }

    public getCameraController(): CameraController {
        return this._cameraController;
    }
}

export default interface ViewApi {
    getCameraController(): CameraController;
}
