import CameraControlsInspector from '@/giro3d/CameraControlsInspector';
import { useCameraStore } from '@/stores/camera';
import { useGiro3dStore } from '@/stores/giro3d';
import CameraPosition from '@/types/CameraPosition';
import type NavigationMode from '@/types/NavigationMode';
import type Instance from '@giro3d/giro3d/core/Instance';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import type Extent from '@giro3d/giro3d/core/geographic/Extent';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type Inspector from '@giro3d/giro3d/gui/Inspector';
import CameraControls from 'camera-controls';
import type { Object3D } from 'three';
import {
    Box3,
    Clock,
    EventDispatcher,
    MathUtils,
    Matrix4,
    Quaternion,
    Raycaster,
    Sphere,
    Spherical,
    Vector2,
    Vector3,
    Vector4,
} from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import type Picker from './Picker';

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
    'interaction-start': {
        /** empty */
    };
    'interaction-end': {
        /** empty */
    };
};

/**
 * Wraps Camera-controls into Giro3D
 */
class CameraController extends EventDispatcher<CameraControllerEventMap> {
    private readonly _instance: Instance;
    private readonly _picker: Picker;
    private readonly _orbitControls: CameraControls;
    private readonly _pickObjectsAt: (e: MouseEvent) => PickResult | null;
    private readonly _clock: Clock;
    private readonly _store = useCameraStore();
    private readonly _giro3dStore = useGiro3dStore();
    private readonly _orbitHelper: CSS2DObject;
    private readonly _positionOnMapHelper: CSS2DObject;
    private _cameraControlsInspector: CameraControlsInspector | null;
    private readonly _boundOnBeforeCameraUpdate: () => void;
    private readonly _boundOnAfterCameraUpdate: () => void;
    private _boundOrbitControlsOnContextMenu!: (e: MouseEvent) => void;
    private _boundOrbitControlsOnMouseUp!: (e: MouseEvent) => void;
    private _boundOrbitControlsOnWheel!: (e: MouseEvent) => void;
    private _boundOrbitControlsOnKey!: (e: KeyboardEvent) => void;
    private _boundPositionOnMapOnMouseMove: ((e: MouseEvent) => void) | null;
    private _boundPositionOnMapOnClick: ((e: MouseEvent) => void) | null;
    private _boundPositionOnMapOnContextMenu: ((e: MouseEvent) => void) | null;

    /**
     * Creates new Camera-controls and bind them to Giro3D.
     *
     * @param instance - Giro3D instance
     * @param picker - Picker
     */
    constructor(instance: Instance, picker: Picker) {
        super();
        this._instance = instance;
        this._picker = picker;
        this._orbitControls = new CameraControls(
            this._instance.view.camera,
            this._instance.domElement,
        );

        const orbitHelperElement = document.createElement('div');
        orbitHelperElement.className = 'helper';
        orbitHelperElement.id = 'orbit-helper';
        const orbitHelperElementIcon = document.createElement('i');
        orbitHelperElementIcon.className = 'bi bi-mouse2-fill text-dark shadow';
        orbitHelperElement.append(orbitHelperElementIcon);

        this._orbitHelper = new CSS2DObject(orbitHelperElement);
        this._instance.add(this._orbitHelper);

        const positionOnMapElement = document.createElement('div');
        positionOnMapElement.className = 'helper';
        positionOnMapElement.id = 'position-on-map-helper';
        const positionOnMapElementIcon = document.createElement('i');
        positionOnMapElementIcon.className = 'fg-position-man text-dark shadow';
        positionOnMapElement.append(positionOnMapElementIcon);

        this._positionOnMapHelper = new CSS2DObject(positionOnMapElement);
        this._instance.add(this._positionOnMapHelper);

        this._cameraControlsInspector = null;

        this.initializeOrbitControls();

        this._pickObjectsAt = (event: MouseEvent) =>
            this._picker.getFirstFeatureAt(this._instance, event, 1)?.at(0) ?? null;

        this._clock = new Clock();

        // Update controls from event loop - this replaces the requestAnimationFrame logic from
        // camera-controls sample code
        this._boundOnBeforeCameraUpdate = this.onBeforeCameraUpdate.bind(this);
        this._boundOnAfterCameraUpdate = this.onAfterCameraUpdate.bind(this);
        this._instance.addEventListener('before-camera-update', this._boundOnBeforeCameraUpdate);
        this._instance.addEventListener('after-camera-update', this._boundOnAfterCameraUpdate);

        this._boundPositionOnMapOnClick = null;
        this._boundPositionOnMapOnMouseMove = null;
        this._boundPositionOnMapOnContextMenu = null;

        this._store.$onAction(({ name, args }) => {
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

        const inspector = this._giro3dStore.getInspector();
        if (inspector != null) {
            this.initializeInspector(inspector);
        }
        this._giro3dStore.$onAction(({ name, after, args }) => {
            after(() => {
                switch (name) {
                    case 'setInspector':
                        this.initializeInspector(args[0]);
                        break;
                }
            });
        });
    }

    dispose() {
        this._instance.removeEventListener('before-camera-update', this._boundOnBeforeCameraUpdate);
        this._instance.removeEventListener('after-camera-update', this._boundOnAfterCameraUpdate);

        this._disablePositionOnMap();
        this.disposeOrbitControls();

        this._instance.remove(this._positionOnMapHelper);
        this._instance.remove(this._orbitHelper);
    }

    private initializeInspector(inspector: Inspector | null) {
        if (this._cameraControlsInspector) {
            this._cameraControlsInspector.dispose();
        }

        if (inspector) {
            this._cameraControlsInspector = new CameraControlsInspector(
                inspector.gui,
                this,
                this._instance,
            );
            inspector.addPanel(this._cameraControlsInspector);
        }
    }

    private initializeOrbitControls() {
        this._orbitControls.infinityDolly = true; // Prevents being stuck when hitting the target

        this.setNavigationMode(this._store.getNavigationMode());

        // Make rotation around where the user clicked when Orbit
        this._boundOrbitControlsOnContextMenu = this.orbitControlsOnContextMenu.bind(this);
        this._boundOrbitControlsOnMouseUp = this.orbitControlsOnMouseUp.bind(this);
        this._instance.domElement.addEventListener(
            'contextmenu',
            this._boundOrbitControlsOnContextMenu,
        );
        this._instance.domElement.addEventListener('mouseup', this._boundOrbitControlsOnMouseUp);

        // "Patch" camera-controls for nicer event handlers
        this._boundOrbitControlsOnWheel = this.orbitControlsOnWheel.bind(this);
        this._instance.domElement.addEventListener('wheel', this._boundOrbitControlsOnWheel);

        // As Giro3d runs the event loop only when needed, we need to notify Giro3d when
        // the controls update the view.
        // We need both events to make sure the view is updated from user interactions and from
        // animations
        this._orbitControls.addEventListener('update', () =>
            this._instance.notifyChange(this._instance.view.camera),
        );
        this._orbitControls.addEventListener('control', () =>
            this._instance.notifyChange(this._instance.view.camera),
        );

        // Dispatch our events
        this._orbitControls.addEventListener('control', () => {
            if (this._orbitControls.active || this._orbitControls.currentAction !== 0) {
                this.dispatchEvent({ type: 'interaction-start' });
                this._store.setIsUserInteracting(true);
            }
        });
        this._orbitControls.addEventListener('controlend', () =>
            setTimeout(() => {
                this._store.setIsUserInteracting(false);
                this.dispatchEvent({ type: 'interaction-end' });
            }),
        );

        this._boundOrbitControlsOnKey = this.orbitControlsOnKey.bind(this);
        this._instance.domElement.addEventListener('keydown', this._boundOrbitControlsOnKey);
    }

    private disposeOrbitControls() {
        this._instance.domElement.removeEventListener('keydown', this._boundOrbitControlsOnKey);

        this._instance.domElement.removeEventListener('wheel', this._boundOrbitControlsOnWheel);

        this._instance.domElement.removeEventListener(
            'contextmenu',
            this._boundOrbitControlsOnContextMenu,
        );
        this._instance.domElement.removeEventListener('mouseup', this._boundOrbitControlsOnMouseUp);

        this._orbitControls.disconnect();
    }

    private orbitControlsOnContextMenu(e: MouseEvent) {
        if (this._store.getNavigationMode() !== 'orbit') {
            return;
        }

        const picked = this._pickObjectsAt(e);
        if (picked) {
            this._orbitHelper.visible = true;
            this._orbitHelper.position.copy(picked.point);
            this._orbitHelper.updateMatrixWorld();
            this._orbitControls.setOrbitPoint(picked.point.x, picked.point.y, picked.point.z);
        } else {
            // We didn't pick anything, we'll orbit around the target
            this._orbitHelper.visible = true;
            this._orbitControls.getTarget(this._orbitHelper.position);
            this._orbitHelper.updateMatrixWorld();
        }
    }
    private orbitControlsOnMouseUp() {
        if (this._store.getNavigationMode() !== 'orbit') {
            return;
        }

        this._orbitHelper.visible = false;
        this._instance.notifyChange();
    }
    private orbitControlsOnWheel() {
        // As camera-controls doesn't dispatch controlstart/controlend events, we need
        // to take care of them for proper events
        this._orbitControls.dispatchEvent({ type: 'controlstart' });
        setTimeout(() => this._orbitControls.dispatchEvent({ type: 'controlend' }), 0);
    }
    private orbitControlsOnKey(e: KeyboardEvent) {
        const navigationMode = this._store.getNavigationMode();

        if (navigationMode === 'position-on-map') {
            if (e.code === 'Escape') {
                this._store.setNavigationMode('orbit');
            }
            return;
        }

        if (navigationMode !== 'orbit' && navigationMode !== 'first-person') {
            return;
        }

        const keys = {
            ARROW_LEFT: 'ArrowLeft',
            ARROW_UP: 'ArrowUp',
            ARROW_RIGHT: 'ArrowRight',
            ARROW_BOTTOM: 'ArrowDown',
            KEY_UP: 'KeyW',
            KEY_LEFT: 'KeyA',
            KEY_RIGHT: 'KeyD',
            KEY_DOWN: 'KeyS',
        };

        let forwardDirection = 0;
        let dollyDirection = 0;
        let truckDirectionX = 0;
        let truckDirectionY = 0;
        let factor = e.ctrlKey || e.metaKey || e.shiftKey ? 200 : 20;

        // Reduce the factor in FPV as we should be close to our data
        if (navigationMode === 'first-person') {
            factor /= 10;
        }

        switch (e.code) {
            case keys.KEY_UP:
                truckDirectionY = -1;
                break;

            case keys.KEY_DOWN:
                truckDirectionY = 1;
                break;

            case keys.ARROW_UP:
                if (navigationMode === 'first-person') {
                    dollyDirection = 1;
                } else {
                    forwardDirection = 1;
                }
                break;

            case keys.ARROW_BOTTOM:
                if (navigationMode === 'first-person') {
                    dollyDirection = -1;
                } else {
                    forwardDirection = -1;
                }
                break;

            case keys.ARROW_LEFT:
            case keys.KEY_LEFT:
                truckDirectionX = -1;
                break;

            case keys.ARROW_RIGHT:
            case keys.KEY_RIGHT:
                truckDirectionX = 1;
                break;

            default:
            // do nothing
        }
        if (forwardDirection) {
            this.executeInteraction(() =>
                this._orbitControls.forward(
                    forwardDirection * this._orbitControls.truckSpeed * factor,
                    true,
                ),
            );
        }
        if (dollyDirection) {
            this.executeInteraction(() =>
                this._orbitControls.dollyInFixed(
                    dollyDirection * this._orbitControls.truckSpeed * factor,
                    true,
                ),
            );
        }
        if (truckDirectionX) {
            this.executeInteraction(() =>
                this._orbitControls.truck(
                    truckDirectionX * this._orbitControls.truckSpeed * factor,
                    0,
                    true,
                ),
            );
        }
        if (truckDirectionY) {
            this.executeInteraction(() =>
                this._orbitControls.truck(
                    0,
                    truckDirectionY * this._orbitControls.truckSpeed * factor,
                    true,
                ),
            );
        }
    }

    private _enablePositionOnMap() {
        this._boundPositionOnMapOnClick = this.onPositionOnMapClick.bind(this);
        this._boundPositionOnMapOnMouseMove = this.onPositionOnMapMouseMove.bind(this);
        this._boundPositionOnMapOnContextMenu = this.onPositionOnMapContextMenu.bind(this);

        this._instance.domElement.addEventListener(
            'mousemove',
            this._boundPositionOnMapOnMouseMove,
        );
        this._instance.domElement.addEventListener('click', this._boundPositionOnMapOnClick);
        this._instance.domElement.addEventListener(
            'contextmenu',
            this._boundPositionOnMapOnContextMenu,
        );
    }

    private _disablePositionOnMap() {
        if (
            this._boundPositionOnMapOnClick ||
            this._boundPositionOnMapOnMouseMove ||
            this._boundPositionOnMapOnContextMenu
        ) {
            if (this._boundPositionOnMapOnClick) {
                this._instance.domElement.removeEventListener(
                    'click',
                    this._boundPositionOnMapOnClick,
                );
            }
            this._boundPositionOnMapOnClick = null;

            if (this._boundPositionOnMapOnMouseMove) {
                this._instance.domElement.removeEventListener(
                    'mousemove',
                    this._boundPositionOnMapOnMouseMove,
                );
            }
            this._boundPositionOnMapOnMouseMove = null;

            if (this._boundPositionOnMapOnContextMenu) {
                this._instance.domElement.removeEventListener(
                    'contextmenu',
                    this._boundPositionOnMapOnContextMenu,
                );
            }
            this._boundPositionOnMapOnContextMenu = null;

            this._positionOnMapHelper.visible = false;
            this._instance.domElement.style.cursor = 'auto';
            this._instance.notifyChange();
        }
    }

    private onPositionOnMapMouseMove(e: MouseEvent) {
        const picked = this._picker.getMapAt(this._instance, e);
        this._instance.domElement.style.cursor = picked ? 'none' : 'auto';
        this._positionOnMapHelper.visible = picked != null;
        if (picked) {
            this._positionOnMapHelper.position.copy(picked.point);
            this._positionOnMapHelper.updateMatrixWorld();
        }
        this._instance.notifyChange();
    }

    private async onPositionOnMapContextMenu(e: MouseEvent) {
        this._disablePositionOnMap();
        this._store.setNavigationMode('orbit');
        e.preventDefault();
    }

    private async onPositionOnMapClick(e: MouseEvent) {
        const picked = this._picker.getMapAt(this._instance, e);
        if (picked) {
            this._disablePositionOnMap();

            const direction = new Vector3();
            this._instance.view.camera.getWorldDirection(direction);
            direction.normalize().setLength(3);

            const newPosition = picked.point.clone();
            newPosition.z += 1.7;

            const newTarget = newPosition.clone();
            newTarget.add(direction);
            newTarget.z = newPosition.z;

            await this.lookAt(newPosition, newTarget, true);
            this._store.setNavigationMode('first-person');
        }
    }

    private setNavigationMode(mode: NavigationMode) {
        this._disablePositionOnMap();

        switch (mode) {
            case 'first-person':
                {
                    this._orbitControls.dollyToCursor = false;
                    this._orbitControls.verticalDragToForward = false;
                    // Set small min/max distance so rotating is always close to the camera position
                    this._orbitControls.minDistance = 2;
                    this._orbitControls.maxDistance = 2;
                    // That requires a large dolly speed for scrolling not to be "stuck"
                    this._orbitControls.dollySpeed = 20;

                    this._orbitControls.azimuthRotateSpeed = 0.3;
                    this._orbitControls.polarRotateSpeed = 0.3;

                    this._orbitControls.mouseButtons.left = CameraControls.ACTION.ROTATE;
                    this._orbitControls.mouseButtons.right = CameraControls.ACTION.TRUCK;
                    this._orbitControls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
                    this._orbitControls.mouseButtons.middle = CameraControls.ACTION.DOLLY;

                    this._orbitControls.enabled = true;

                    // Set new target close to the camera position so it feels like we're rotating around the camera position
                    const direction = new Vector3();
                    const position = this._instance.view.camera.position.clone();
                    const newTarget = new Vector3();
                    this._instance.view.camera.getWorldDirection(direction);

                    direction.normalize().setLength(3);
                    newTarget.copy(position).add(direction);
                    this.lookAt(position, newTarget, false);
                }
                break;
            case 'orbit':
                {
                    this._orbitControls.dollyToCursor = true;
                    this._orbitControls.verticalDragToForward = true;
                    this._orbitControls.minDistance = 2;
                    this._orbitControls.maxDistance = Infinity;
                    this._orbitControls.dollySpeed = 1;

                    this._orbitControls.azimuthRotateSpeed = 1.0;
                    this._orbitControls.polarRotateSpeed = 1.0;

                    this._orbitControls.mouseButtons.left = CameraControls.ACTION.TRUCK;
                    this._orbitControls.mouseButtons.right = CameraControls.ACTION.ROTATE;
                    this._orbitControls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
                    this._orbitControls.mouseButtons.middle = CameraControls.ACTION.DOLLY;

                    this._orbitControls.enabled = true;

                    // Try to restore a proper target so it doesn't require a right-click to properly truck/dolly
                    const direction = new Vector3();
                    const position = this._instance.view.camera.position.clone();
                    this._instance.view.camera.getWorldDirection(direction);

                    const raycaster = new Raycaster();
                    raycaster.camera = this._instance.view.camera;
                    raycaster.set(position, direction);
                    const intersects = raycaster.intersectObject(this._instance.scene).at(0);

                    if (intersects) {
                        this.lookAt(position, intersects.point, false);
                    }
                }
                break;
            case 'position-on-map':
                this._orbitControls.enabled = false;
                this._enablePositionOnMap();
                break;
            case 'disabled':
                this._orbitControls.enabled = false;
                break;
            default: {
                // Exhaustiveness checking
                const _exhaustiveCheck: never = mode;
                return _exhaustiveCheck;
            }
        }
        this._instance.domElement.focus();
    }

    onBeforeCameraUpdate() {
        // Called from giro3d
        const delta = this._clock.getDelta();
        const hasControlsUpdated = this._orbitControls.update(delta);
        if (hasControlsUpdated) {
            this._instance.notifyChange(this._instance.view.camera);
        }
    }

    onAfterCameraUpdate() {
        // this.instance.view.camera.position is *not always* the same as orbitControls.getPosition()
        this._store.setCurrentPosition(
            this.getCameraPosition(),
            this._instance.view.camera.position,
        );
    }

    /**
     * Executes an interaction with animation.
     *
     * Required to call this instead of calling directly camera-controls because
     * of how Giro3D mainloop works.
     *
     * @param callback - Interaction to execute
     * @returns Resolves when interaction is done
     */
    executeInteraction<T = void>(callback: () => Promise<T>): Promise<T> {
        this._orbitControls.update(this._clock.getDelta());

        // Execute the interaction
        const res = callback();

        // As mainloop can pause, before_camera_update can be triggered irregularly
        // Make sure to "reset" the clock to enable smooth transitions with camera-controls
        this._orbitControls.update(this._clock.getDelta());
        // Dispatch events so giro3d and giro3dservice gets notified
        this._orbitControls.dispatchEvent({ type: 'update' });
        return res;
    }

    /**
     * Sets initial position of camera to view an extent.
     *
     * @param extent - Extent to look at
     * @param altitude - Altitude of camera
     */
    setInitialPosition(extent: Extent, altitude = 4000) {
        const cameraPosition = new Coordinates(
            extent.crs,
            extent.west,
            extent.south,
            altitude,
        ).toVector3();
        const center = extent.centerAsVector3();
        this.lookAt(cameraPosition, center, false);
    }

    /**
     * Sets the camera to look at a position.
     *
     * @param position - Position of the camera
     * @param lookAt - Posiiton to look at
     * @param enableTransition - Enables transition
     * @returns Resolves when interaction is done
     */
    async lookAt(
        position: Vector3,
        lookAt: Vector3,
        enableTransition: boolean = false,
    ): Promise<void> {
        await this.executeInteraction(async () => {
            // Need to reset focal offset because of orbit point
            // https://github.com/yomotsu/camera-controls/issues/303
            this._orbitControls.setFocalOffset(0, 0, 0, false);
            return this._orbitControls.setLookAt(
                position.x,
                position.y,
                position.z,
                lookAt.x,
                lookAt.y,
                lookAt.z,
                enableTransition,
            );
        });
        this._orbitControls.setOrbitPoint(lookAt.x, lookAt.y, lookAt.z);
    }

    get enabled() {
        return this._orbitControls.enabled;
    }

    set enabled(v: boolean) {
        this._orbitControls.enabled = v;
    }

    getCameraPosition(target?: CameraPosition): CameraPosition {
        const controls = this._orbitControls;
        const cameraPosition =
            target ?? new CameraPosition(new Vector3(), new Vector3(), new Vector3());

        controls.getPosition(cameraPosition.camera);
        controls.getTarget(cameraPosition.target);
        controls.getFocalOffset(cameraPosition.focalOffset);

        return cameraPosition;
    }

    setCamera(pos: CameraPosition) {
        this.executeInteraction(async () => {
            this._orbitControls.setOrbitPoint(0, 0, 0);
            this._orbitControls.setLookAt(
                pos.camera.x,
                pos.camera.y,
                pos.camera.z,
                pos.target.x,
                pos.target.y,
                pos.target.z,
                false,
            );
            this._orbitControls.setFocalOffset(
                pos.focalOffset.z,
                pos.focalOffset.y,
                pos.focalOffset.z,
                false,
            );
            this._orbitControls.update(0);
        });
    }

    /**
     * Looks to a bounding box or Object3D.
     *
     * @param obj - Bounding box or Object to look at
     * @param enableTransition - Enables transition
     * @param options - Camera-controls' fitToBox options
     * @returns Resolves when interaction is done
     */
    goToBox(
        obj: Box3 | Object3D | Entity3D,
        enableTransition: boolean = true,
        options: object = {
            paddingTop: 10,
            paddingLeft: 10,
            paddingBottom: 10,
            paddingRight: 10,
        },
    ): Promise<void[]> {
        const bbox = this.getBox(obj);
        return this.executeInteraction(() => {
            this._orbitControls.setFocalOffset(0, 0, 0);
            return this._orbitControls.fitToBox(bbox, enableTransition, options);
        });
    }

    lookTopDownAt(obj: Box3 | Object3D | Entity3D, enableTransition = true) {
        const center = new Vector3();
        const size = new Vector3();
        const newCameraPosition = new Vector3(0, 0, 1);

        const bbox = this.getBox(obj);
        bbox.min.z = bbox.max.z;
        bbox.getCenter(center);
        bbox.getSize(size);

        const distance = this._orbitControls.getDistanceToFitBox(size.x, size.y, 0);
        const cameraPosition = newCameraPosition.multiplyScalar(distance).add(center);

        // Slightly offset camera to avoid gimbal lock
        cameraPosition.x += size.x / 10;
        cameraPosition.y -= size.y / 10;

        return this.lookAt(cameraPosition, center, enableTransition);
    }

    protected getBox(obj: Box3 | Object3D | Entity3D): Box3 {
        // We produce broken CityJSON (bbox.max.z being 10e38), workaround that!
        let bbox = new Box3();
        if ((obj as Box3).isBox3) {
            bbox = (obj as Box3).clone();
        } else if ((obj as Entity3D).isEntity3D) {
            const entity3d = obj as Entity3D;
            const entityBbox = entity3d.getBoundingBox();
            if (entityBbox && !entityBbox.isEmpty()) {
                bbox = entityBbox.clone();
            } else if ('extent' in entity3d) {
                // In case object is hidden
                bbox = (entity3d.extent as Extent).toBox3(0, 200);
            }
        } else if ((obj as Object3D).isObject3D) {
            bbox.setFromObject(obj as Object3D);
        } else {
            throw new Error('obj should be instanceof Box3, Object3D or Entity3D');
        }
        if (bbox.isEmpty()) {
            throw new Error('Could not find bounding box of object');
        }

        bbox.min.z = Math.max(bbox.min.z, 0);
        bbox.max.z = Math.min(bbox.max.z, 2000);

        return bbox;
    }
}

export default CameraController;
