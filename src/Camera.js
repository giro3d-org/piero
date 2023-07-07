import {
    Box3,
    Clock,
    Vector3,
    Vector2,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Sphere,
    Raycaster,
    MathUtils,
    EventDispatcher,
} from 'three';
import CameraControls from 'camera-controls';

CameraControls.install({
    THREE: {
        Vector2,
        Vector3,
        Vector4,
        Quaternion,
        Matrix4,
        Spherical,
        Box3,
        Sphere,
        Raycaster,
        MathUtils,
    },
});

class Camera extends EventDispatcher {
    constructor(instance) {
        super();
        this.instance = instance;
        this.controls = new CameraControls(this.instance.camera.camera3D, this.instance.domElement);
        this.instance.controls = this.controls;

        this.controls.dollyToCursor = true;
        this.controls.enableDamping = true;
        this.controls.verticalDragToForward = true;

        this.controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
        this.controls.mouseButtons.right = CameraControls.ACTION.ROTATE;
        this.controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
        this.controls.mouseButtons.middle = CameraControls.ACTION.DOLLY;

        this.pickObjectsAt = e => this.instance.pickObjectsAt(e, {
            limit: 1,
            radius: 20,
            filter: p => (
                // Make sure we pick a valid point
                Number.isFinite(p.point.x)
                    && Number.isFinite(p.point.y)
                    && Number.isFinite(p.point.z)
            ),
        }).at(0);

        // Make rotation around where the user clicked
        this.instance.domElement.addEventListener('contextmenu', e => {
            const picked = this.pickObjectsAt(e);
            if (picked) {
                this.controls.setOrbitPoint(picked.point.x, picked.point.y, picked.point.z);
            }
        });
        this.instance.domElement.addEventListener('wheel', () => {
            // As camera-controls doesn't dispatch controlstart/controlend events, we need
            // to take care of them for proper events
            this.controls.dispatchEvent({ type: 'controlstart' });
            setTimeout(() => this.controls.dispatchEvent({ type: 'controlend' }), 0);
        });

        this.clock = new Clock();

        // Update controls from event loop - this replaces the requestAnimationFrame logic from
        // camera-controls sample code
        this.instance.addFrameRequester('before_camera_update', () => {
            // Called from giro3d
            const delta = this.clock.getDelta();
            const hasControlsUpdated = this.controls.update(delta);
            if (hasControlsUpdated) {
                this.instance.notifyChange(this.instance.camera.camera3D);
            }
        });

        // As Giro3d runs the event loop only when needed, we need to notify Giro3d when
        // the controls update the view.
        // We need both events to make sure the view is updated from user interactions and from
        // animations
        this.controls.addEventListener('update', () => this.instance.notifyChange(this.instance.camera.camera3D));
        this.controls.addEventListener('control', () => this.instance.notifyChange(this.instance.camera.camera3D));

        this.controls.addEventListener('control', () => {
            if (this.controls.active || this.controls.currentAction !== 0) {
                this.dispatchEvent({ type: 'interaction-start' });
            }
        });
        this.controls.addEventListener('controlend', () => setTimeout(() => {
            this.dispatchEvent({ type: 'interaction-end' });
        }));
    }

    bindKeys() {
        // Add some controls on keyboard
        const keys = {
            LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown',
        };
        this.instance.domElement.addEventListener('keydown', e => {
            let forwardDirection = 0;
            let truckDirectionX = 0;
            const factor = (e.ctrlKey || e.metaKey || e.shiftKey ? 200 : 20);
            switch (e.code) {
                case keys.UP:
                    forwardDirection = 1;
                    break;

                case keys.BOTTOM:
                    forwardDirection = -1;
                    break;

                case keys.LEFT:
                    truckDirectionX = -1;
                    break;

                case keys.RIGHT:
                    truckDirectionX = 1;
                    break;

                default:
                // do nothing
            }
            if (forwardDirection) {
                this.executeInteraction(() => this.controls.forward(
                    forwardDirection * this.controls.truckSpeed * factor, true,
                ));
            }
            if (truckDirectionX) {
                this.executeInteraction(() => this.controls.truck(
                    truckDirectionX * this.controls.truckSpeed * factor, 0, true,
                ));
            }
        });
    }

    executeInteraction(callback) {
        // Execute the interaction
        const res = callback() ?? Promise.resolve();

        // As mainloop can pause, before_camera_update can be triggered irregularly
        // Make sure to "reset" the clock to enable smooth transitions with camera-controls
        this.clock.getDelta();
        // Dispatch events so giro3d and giro3dservice gets notified
        this.controls.dispatchEvent({ type: 'update' });
        return res;
    }

    lookAt(position, lookAt, enableTransition = false) {
        this.executeInteraction(() => this.controls.setLookAt(
            position.x, position.y, position.z, lookAt.x, lookAt.y, lookAt.z, enableTransition,
        ));
    }

    goToBox(bbox, enableTransition = true, options = {
        paddingTop: 10, paddingLeft: 10, paddingBottom: 10, paddingRight: 10,
    }) {
        if (bbox instanceof Box3) {
            bbox.min.z = Math.max(bbox.min.z, 0);
            bbox.max.z = Math.min(bbox.max.z, 2000);
        }
        return this.executeInteraction(() => this.controls.fitToBox(
            bbox, enableTransition, options,
        ));
    }
}

export default Camera;
