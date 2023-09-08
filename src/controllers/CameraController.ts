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
    Object3D,
} from 'three';
import CameraControls from 'camera-controls';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Instance from '@giro3d/giro3d/core/Instance';
import CameraPosition from '@/types/CameraPosition';
import { useCameraStore } from '@/stores/camera';

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

/**
 * Wraps Camera-controls into Giro3D
 */
class Camera extends EventDispatcher {
    instance: Instance;
    controls: CameraControls;
    pickObjectsAt: (e: any) => any;
    clock: Clock;
    private readonly store = useCameraStore();

    /**
     * Creates new Camera-controls and bind them to Giro3D.
     *
     * @param instance Giro3D instance
     */
    constructor(instance: Instance) {
        super();
        this.instance = instance;
        this.controls = new CameraControls(this.instance.camera.camera3D, this.instance.domElement);
        this.instance.controls = this.controls;

        this.controls.dollyToCursor = true;
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

        this.instance.addFrameRequester('after_camera_update', () => {
            this.store.setCurrentPosition(this.getCameraPosition());
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

        this.store.$onAction(({
            name,
            args
        }) => {
            switch (name) {
                case 'setCameraPosition':
                    this.setCamera(args[0]);
                    break;
            }
        });
    }

    /**
     * Binds keyboard keys to camera-controls
     */
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

    /**
     * Executes an interaction with animation.
     *
     * Required to call this instead of calling directly camera-controls because
     * of how Giro3D mainloop works.
     *
     * @param {Function} callback Interacition to execute
     * @returns {Promise} Resolves when interaction is done
     */
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

    /**
     * Sets initial position of camera to view an extent.
     *
     * @param {Extent} extent Extent to look at
     * @param {number} [altitude=4000] Altitude of camera
     */
    setInitialPosition(extent, altitude = 4000) {
        const cameraPosition = new Coordinates(
            'EPSG:2154',
            extent.west(), extent.south(), altitude,
        ).xyz();
        const center = extent.center().xyz();
        this.lookAt(cameraPosition, center, false);
    }

    /**
     * Sets the camera to look at a position.
     *
     * @param {Vector3} position Position of the camera
     * @param {Vector3} lookAt Posiiton to look at
     * @param {boolean} [enableTransition=false] Enables transition
     * @returns {Promise} Resolves when interaction is done
     */
    lookAt(position, lookAt, enableTransition = false) {
        return this.executeInteraction(() => this.controls.setLookAt(
            position.x, position.y, position.z, lookAt.x, lookAt.y, lookAt.z, enableTransition,
        ));
    }

    getCameraPosition(): CameraPosition {
        const controls = this.controls;
        const cameraPosition = new CameraPosition(new Vector3(), new Vector3(), new Vector3());

        controls.getPosition(cameraPosition.camera);
        controls.getTarget(cameraPosition.target);
        controls.getFocalOffset(cameraPosition.focalOffset);

        return cameraPosition;
    }

    setCamera(pos: CameraPosition) {
        this.executeInteraction(() => {
            this.controls.setOrbitPoint(0, 0, 0);
            this.controls.setLookAt(pos.camera.x, pos.camera.y, pos.camera.z, pos.target.x, pos.target.y, pos.target.z, false);
            this.controls.setFocalOffset(pos.focalOffset.z, pos.focalOffset.y, pos.focalOffset.z, false);
            this.controls.update(0);
        });
    }

    /**
     * Looks to a bounding box or Object3D.
     *
     * @param {Box3|Object3D} obj Bounding box or Object to look at
     * @param {boolean} [enableTransition=true] Enables transition
     * @param {object} options Camera-controls' fitToBox options
     * @returns {Promise} Resolves when interaction is done
     */
    goToBox(obj, enableTransition = true, options = {
        paddingTop: 10, paddingLeft: 10, paddingBottom: 10, paddingRight: 10,
    }) {
        // We produce broken CityJSON (bbox.max.z being 10e38), workaround that!
        let bbox = new Box3();
        if (obj instanceof Box3) {
            bbox = obj.clone();
        } else if (obj instanceof Entity3D) {
            bbox = obj.getBoundingBox();
            if (bbox.isEmpty() && obj.extent) {
                // In case object is hidden
                bbox = obj.extent.toBox3(0, 200);
                // TODO: clamp to extent of map!
            }
        } else if (obj instanceof Object3D) {
            bbox.setFromObject(obj);
        } else {
            throw new Error('obj should be instanceof Box3 or Object3D');
        }
        bbox.min.z = Math.max(bbox.min.z, 0);
        bbox.max.z = Math.min(bbox.max.z, 2000);

        return this.executeInteraction(() => this.controls.fitToBox(
            bbox, enableTransition, options,
        ));
    }

    lookTopDownAt(obj, enableTransition = true) {
        return this.executeInteraction(async () => {
            await this.controls.rotateTo(0, 0, enableTransition);
            this.goToBox(obj, enableTransition);
        });
    }
}

export default Camera;
