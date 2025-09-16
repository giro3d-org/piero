import type CameraController from '@/services/CameraController';
import CameraPosition from '@/types/CameraPosition';
import type Instance from '@giro3d/giro3d/core/Instance';
import Panel from '@giro3d/giro3d/gui/Panel';
import type GUI from 'lil-gui';
import { Vector3 } from 'three';

class CameraControlsInspector extends Panel {
    camera: CameraController;
    private _cameraPosition: CameraPosition;
    private _boundOnAfterCameraUpdate: () => void;

    /**
     * @param gui - The GUI.
     * @param instance - The Giro3D instance.
     */
    constructor(gui: GUI, cameraController: CameraController, instance: Instance) {
        super(gui, instance, 'Camera Controls');

        this.camera = cameraController;
        this._cameraPosition = new CameraPosition(new Vector3(), new Vector3(), new Vector3());

        this._boundOnAfterCameraUpdate = this.onAfterCameraUpdate.bind(this);
        this.instance.addEventListener('after-camera-update', this._boundOnAfterCameraUpdate);

        const position = this.gui.addFolder('Position');
        position.close();
        this._controllers.push(position.add(this._cameraPosition.camera, 'x'));
        this._controllers.push(position.add(this._cameraPosition.camera, 'y'));
        this._controllers.push(position.add(this._cameraPosition.camera, 'z'));

        const target = this.gui.addFolder('Target');
        target.close();
        this._controllers.push(target.add(this._cameraPosition.target, 'x'));
        this._controllers.push(target.add(this._cameraPosition.target, 'y'));
        this._controllers.push(target.add(this._cameraPosition.target, 'z'));

        const focalOffset = this.gui.addFolder('Focal offset');
        focalOffset.close();
        this._controllers.push(focalOffset.add(this._cameraPosition.focalOffset, 'x'));
        this._controllers.push(focalOffset.add(this._cameraPosition.focalOffset, 'y'));
        this._controllers.push(focalOffset.add(this._cameraPosition.focalOffset, 'z'));
    }

    dispose(): void {
        this.instance.removeEventListener('after-camera-update', this._boundOnAfterCameraUpdate);
        super.dispose();
    }

    private onAfterCameraUpdate() {
        this.camera.getCameraPosition(this._cameraPosition);
    }
}

export default CameraControlsInspector;
