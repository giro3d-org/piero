import type GUI from 'lil-gui';
import { Vector3 } from 'three';
import Panel from '@giro3d/giro3d/gui/Panel';
import type Instance from '@giro3d/giro3d/core/Instance';
import CameraController from '@/services/CameraController';
import CameraPosition from '@/types/CameraPosition';

class CameraControlsInspector extends Panel {
    camera: CameraController;
    private cameraPosition: CameraPosition;

    /**
     * @param gui The GUI.
     * @param instance The Giro3D instance.
     */
    constructor(gui: GUI, cameraController: CameraController, instance: Instance) {
        super(gui, instance, 'Camera Controls');

        this.camera = cameraController;
        this.cameraPosition = new CameraPosition(new Vector3(), new Vector3(), new Vector3());

        this.instance.addEventListener('after-camera-update', () => {
            this.onAfterCameraUpdate();
        });

        const position = this.gui.addFolder('Position');
        position.close();
        this._controllers.push(position.add(this.cameraPosition.camera, 'x'));
        this._controllers.push(position.add(this.cameraPosition.camera, 'y'));
        this._controllers.push(position.add(this.cameraPosition.camera, 'z'));

        const target = this.gui.addFolder('Target');
        target.close();
        this._controllers.push(target.add(this.cameraPosition.target, 'x'));
        this._controllers.push(target.add(this.cameraPosition.target, 'y'));
        this._controllers.push(target.add(this.cameraPosition.target, 'z'));

        const focalOffset = this.gui.addFolder('Focal offset');
        focalOffset.close();
        this._controllers.push(focalOffset.add(this.cameraPosition.focalOffset, 'x'));
        this._controllers.push(focalOffset.add(this.cameraPosition.focalOffset, 'y'));
        this._controllers.push(focalOffset.add(this.cameraPosition.focalOffset, 'z'));
    }

    private onAfterCameraUpdate() {
        this.camera.getCameraPosition(this.cameraPosition);
    }
}

export default CameraControlsInspector;
