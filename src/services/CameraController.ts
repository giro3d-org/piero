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
import FirstPersonControls from '@giro3d/giro3d/controls/FirstPersonControls';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Drawing from '@giro3d/giro3d/interactions/Drawing';
import Instance from '@giro3d/giro3d/core/Instance';
import CameraPosition from '@/types/CameraPosition';
import { useCameraStore } from '@/stores/camera';
import { Extent } from '@giro3d/giro3d/core/geographic';
import NavigationMode from '@/types/NavigationMode';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import Picker from './Picker';

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

type CameraControllerEventMap = {
    'interaction-start': {},
    'interaction-end': {},
};

/**
 * Wraps Camera-controls into Giro3D
 */
class CameraController extends EventDispatcher<CameraControllerEventMap> {
    private readonly instance: Instance;
    private readonly picker: Picker;
    private readonly orbitControls: CameraControls;
    private readonly pickObjectsAt: (e: any) => any;
    private readonly clock: Clock;
    private readonly store = useCameraStore();
    private readonly firstPersonControls: FirstPersonControls;
    private readonly defaultSpeed: number;
    private readonly orbitHelper: CSS2DObject;

    /**
     * Creates new Camera-controls and bind them to Giro3D.
     *
     * @param instance Giro3D instance
     * @param picker Picker
     */
    constructor(instance: Instance, picker: Picker) {
        super();
        this.instance = instance;
        this.picker = picker;
        this.orbitControls = new CameraControls(this.instance.camera.camera3D, this.instance.domElement);
        this.firstPersonControls = new FirstPersonControls(this.instance);
        this.instance.controls = this.orbitControls;
        this.defaultSpeed = this.orbitControls.maxSpeed;
        this.orbitHelper = new CSS2DObject(document.getElementById('orbit-helper') as HTMLElement);
        this.instance.add(this.orbitHelper);

        this.initializeOrbitControls();
        this.initializeFirstPersonControls();

        this.pickObjectsAt = (event: MouseEvent) => this.picker.getFirstFeatureAt(this.instance, event, 1);

        this.clock = new Clock();

        // Update controls from event loop - this replaces the requestAnimationFrame logic from
        // camera-controls sample code
        this.instance.addEventListener('before-camera-update', () => {
            this.onBeforeCameraUpdate();
        });

        this.instance.addEventListener('after-camera-update', () => {
            this.onAfterCameraUpdate();
        });

        this.store.$onAction(({
            name,
            args
        }) => {
            switch (name) {
                case 'setCameraPosition':
                    this.setCamera(args[0]);
                    break;
                case 'setNavigationMode':
                    this.setNavigationMode(args[0]);
                    break;
                case 'lookTopDownAt':
                    this.lookTopDownAt(args[0]);
                    break;
            }
        });
    }

    private initializeFirstPersonControls() {
        this.firstPersonControls.enabled = false;
        // this.instance.scene.add(this.firstPersonControls.getObject());
        // this.firstPersonControls.disconnect();
    }

    private initializeOrbitControls() {
        this.orbitControls.dollyToCursor = true;
        this.orbitControls.verticalDragToForward = true;

        this.orbitControls.mouseButtons.left = CameraControls.ACTION.TRUCK;
        this.orbitControls.mouseButtons.right = CameraControls.ACTION.ROTATE;
        this.orbitControls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
        this.orbitControls.mouseButtons.middle = CameraControls.ACTION.DOLLY;

        // Make rotation around where the user clicked
        this.instance.domElement.addEventListener('contextmenu', e => {
            if (this.store.getNavigationMode() !== 'orbit') return;

            const picked = this.pickObjectsAt(e);
            if (picked) {
                this.orbitHelper.visible = true;
                this.orbitHelper.position.copy(picked.point);
                this.orbitHelper.updateMatrixWorld();
                this.orbitControls.setOrbitPoint(picked.point.x, picked.point.y, picked.point.z);
            } else {
                // We didn't pick anything, we'll orbit around the target
                this.orbitHelper.visible = true;
                this.orbitControls.getTarget(this.orbitHelper.position);
                this.orbitHelper.updateMatrixWorld();
            }
        });
        this.instance.domElement.addEventListener('wheel', () => {
            if (this.store.getNavigationMode() !== 'orbit') return;

            // As camera-controls doesn't dispatch controlstart/controlend events, we need
            // to take care of them for proper events
            this.orbitControls.dispatchEvent({ type: 'controlstart' });
            setTimeout(() => this.orbitControls.dispatchEvent({ type: 'controlend' }), 0);
        });

        this.instance.domElement.addEventListener('mouseup', () => {
            if (this.store.getNavigationMode() !== 'orbit') return;

            this.orbitHelper.visible = false;
            this.instance.notifyChange();
        });
        // As Giro3d runs the event loop only when needed, we need to notify Giro3d when
        // the controls update the view.
        // We need both events to make sure the view is updated from user interactions and from
        // animations
        this.orbitControls.addEventListener('update', () => this.instance.notifyChange(this.instance.camera.camera3D));
        this.orbitControls.addEventListener('control', () => this.instance.notifyChange(this.instance.camera.camera3D));

        this.orbitControls.addEventListener('control', () => {
            if (this.orbitControls.active || this.orbitControls.currentAction !== 0) {
                this.dispatchEvent({ type: 'interaction-start' });
                this.store.setIsUserInteracting(true);
            }
        });
        this.orbitControls.addEventListener('controlend', () => setTimeout(() => {
            this.store.setIsUserInteracting(false);
            this.dispatchEvent({ type: 'interaction-end' });
        }));

        this.bindKeys();
    }

    private setNavigationMode(mode: NavigationMode) {
        switch (mode) {
            case 'first-person':
                // this.orbitControls.maxSpeed = 2; // m/s
                this.orbitControls.enabled = false;
                this.firstPersonControls.enabled = true;
                this.firstPersonControls.reset();
                this.orbitControls.disconnect();
                break;
            case 'orbit':
                // this.orbitControls.maxSpeed = this.defaultSpeed;
                this.firstPersonControls.enabled = false;
                this.orbitControls.connect(this.instance.domElement);
                this.orbitControls.enabled = true;
                break;
            case 'disabled':
                this.orbitControls.enabled = false;
                this.firstPersonControls.enabled = false;
                this.orbitControls.disconnect();
                break;
        }
        this.instance.domElement.focus();
    }

    onBeforeCameraUpdate() {
        // Called from giro3d
        const delta = this.clock.getDelta();
        let hasControlsUpdated = false;
        switch (this.store.getNavigationMode()) {
            case 'first-person':
                // this.firstPersonControls.update(delta);
                break;
            case 'orbit':
                hasControlsUpdated = this.orbitControls.update(delta);
                break;
        }

        if (hasControlsUpdated) {
            this.instance.notifyChange(this.instance.camera.camera3D);
        }
    }

    onAfterCameraUpdate() {
        this.store.setCurrentPosition(this.getCameraPosition());
    }

    /**
     * Binds keyboard keys to camera-controls
     */
    private bindKeys() {
        // Add some controls on keyboard
        const keys = {
            LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown',
        };
        this.instance.domElement.addEventListener('keydown', e => {
            if (this.store.getNavigationMode() !== 'orbit') return;

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
                this.executeInteraction(() => this.orbitControls.forward(
                    forwardDirection * this.orbitControls.truckSpeed * factor, true,
                ));
            }
            if (truckDirectionX) {
                this.executeInteraction(() => this.orbitControls.truck(
                    truckDirectionX * this.orbitControls.truckSpeed * factor, 0, true,
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
     * @param callback Interacition to execute
     * @returns Resolves when interaction is done
     */
    executeInteraction(callback: Function): Promise<any> {
        // Execute the interaction
        const res = callback() ?? Promise.resolve();

        // As mainloop can pause, before_camera_update can be triggered irregularly
        // Make sure to "reset" the clock to enable smooth transitions with camera-controls
        this.clock.getDelta();
        // Dispatch events so giro3d and giro3dservice gets notified
        this.orbitControls.dispatchEvent({ type: 'update' });
        return res;
    }

    /**
     * Sets initial position of camera to view an extent.
     *
     * @param extent Extent to look at
     * @param altitude Altitude of camera
     */
    setInitialPosition(extent: Extent, altitude = 4000) {
        const cameraPosition = new Coordinates(
            extent.crs(),
            extent.west(), extent.south(), altitude,
        ).toVector3();
        const center = extent.center().toVector3();
        this.lookAt(cameraPosition, center, false);
    }

    /**
     * Sets the camera to look at a position.
     *
     * @param position Position of the camera
     * @param lookAt Posiiton to look at
     * @param enableTransition Enables transition
     * @returns Resolves when interaction is done
     */
    lookAt(position: Vector3, lookAt: Vector3, enableTransition: boolean = false): Promise<any> {
        return this.executeInteraction(() => this.orbitControls.setLookAt(
            position.x, position.y, position.z, lookAt.x, lookAt.y, lookAt.z, enableTransition,
        ));
    }

    getCameraPosition(): CameraPosition {
        const controls = this.orbitControls;
        const cameraPosition = new CameraPosition(new Vector3(), new Vector3(), new Vector3());

        controls.getPosition(cameraPosition.camera);
        controls.getTarget(cameraPosition.target);
        controls.getFocalOffset(cameraPosition.focalOffset);

        return cameraPosition;
    }

    setCamera(pos: CameraPosition) {
        this.executeInteraction(() => {
            this.orbitControls.setOrbitPoint(0, 0, 0);
            this.orbitControls.setLookAt(pos.camera.x, pos.camera.y, pos.camera.z, pos.target.x, pos.target.y, pos.target.z, false);
            this.orbitControls.setFocalOffset(pos.focalOffset.z, pos.focalOffset.y, pos.focalOffset.z, false);
            this.orbitControls.update(0);
        });
    }

    /**
     * Looks to a bounding box or Object3D.
     *
     * @param obj Bounding box or Object to look at
     * @param enableTransition Enables transition
     * @param options Camera-controls' fitToBox options
     * @returns Resolves when interaction is done
     */
    goToBox(obj: Box3 | Object3D | Entity3D, enableTransition: boolean = true, options: object = {
        paddingTop: 10, paddingLeft: 10, paddingBottom: 10, paddingRight: 10,
    }): Promise<any> {
        // We produce broken CityJSON (bbox.max.z being 10e38), workaround that!
        let bbox = new Box3();
        if ((obj as any).isBox3) {
            bbox = (obj as Box3).clone();
        } else if ((obj as any).isEntity3D) {
            const entity3d = obj as Entity3D;
            const entityBbox = entity3d.getBoundingBox();
            if (entityBbox && !entityBbox.isEmpty()) {
                bbox = entityBbox.clone();
            } else if ('extent' in entity3d) {
                // In case object is hidden
                bbox = (entity3d.extent as Extent).toBox3(0, 200);
            }
        } else if ((obj as any).isDrawing) {
            const drawing = obj as Drawing;
            // TODO: this should probably be part of Drawing in Giro3D
            if (drawing.geometryType === 'Point') {
                bbox.setFromCenterAndSize(
                    new Vector3(drawing.coordinates[0], drawing.coordinates[1], drawing.coordinates[2]),
                    new Vector3(10, 10, 10),
                );
            } else if (drawing.geometryType === 'MultiPoint') {
                const pts = [];
                for (let i=0; i < drawing.coordinates.length; i += 3) {
                    pts.push(new Vector3(drawing.coordinates[i], drawing.coordinates[i+1], drawing.coordinates[i+2]));
                }
                bbox.setFromPoints(pts);
            } else {
                bbox.setFromObject(drawing);
            }
        } else if ((obj as any).isObject3D) {
            bbox.setFromObject(obj as Object3D);
        } else {
            throw new Error('obj should be instanceof Box3, Object3D or Entity3D');
        }
        if (bbox.isEmpty()) throw new Error('Could not find bounding box of object');

        bbox.min.z = Math.max(bbox.min.z, 0);
        bbox.max.z = Math.min(bbox.max.z, 2000);

        return this.executeInteraction(() => this.orbitControls.fitToBox(
            bbox, enableTransition, options,
        ));
    }

    lookTopDownAt(obj: Box3 | Object3D | Entity3D, enableTransition = true) {
        return this.executeInteraction(async () => {
            await this.orbitControls.rotateTo(0, 0, enableTransition);
            this.goToBox(obj, enableTransition);
        });
    }
}

export default CameraController;
