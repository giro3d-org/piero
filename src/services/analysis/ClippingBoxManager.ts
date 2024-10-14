import { useAnalysisStore } from '@/stores/analysis';
import { useCameraStore } from '@/stores/camera';
import { useDatasetStore } from '@/stores/datasets';
import type NavigationMode from '@/types/NavigationMode';
import type Instance from '@giro3d/giro3d/core/Instance';
import {
    Box3,
    Box3Helper,
    BoxGeometry,
    Color,
    Group,
    Mesh,
    MeshBasicMaterial,
    Plane,
    Vector3,
} from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

const helperMaterial = new MeshBasicMaterial({ color: 'yellow', opacity: 0.1, transparent: true });

export default class ClippingBoxManager {
    private readonly _instance: Instance;
    private readonly _volumeHelpers: Group;
    private _clippingBox: Box3 | null;
    private _clippingBoxHelper: Box3Helper | null;
    private _clippingBoxMesh: Mesh | null;
    private _transformControls: TransformControls | null;
    private _previousTransformControls: NavigationMode;

    private readonly _store = useAnalysisStore();
    private readonly _cameraStore = useCameraStore();
    private readonly _datasetStore = useDatasetStore();

    constructor(instance: Instance) {
        this._instance = instance;
        this._volumeHelpers = new Group();
        instance.scene.add(this._volumeHelpers);

        this._clippingBox = null;
        this._clippingBoxHelper = null;
        this._clippingBoxMesh = null;
        this._transformControls = null;
        this._previousTransformControls = this._cameraStore.getNavigationMode();

        this._store.$onAction(({ name, after }) => {
            after(() => {
                switch (name) {
                    case 'enableClippingBox':
                    case 'displayClippingBoxHelper':
                    case 'setClippingBoxSize':
                    case 'setClippingBox':
                        // Need to recreate the whole box
                        this.updateClippingBox();
                        break;
                    case 'setClippingBoxCenter':
                        // We can simply move the existing box
                        this.moveClippingBox();
                        break;
                    case 'setClippingBoxInverted':
                        this.applyClippingPlanes();
                        break;
                }
            });
        });

        this._datasetStore.$onAction(({ name, after }) => {
            after(() => {
                switch (name) {
                    case 'attachEntity':
                        this.applyClippingPlanes();
                        break;
                }
            });
        });
    }

    dispose() {
        this._instance.scene.remove(this._volumeHelpers);
        this.disposeClippingBox();
    }

    /**
     * Creates the whole clipping box and helpers if displayed
     * @param center - Center of the clipping box
     * @param size - Size of the clipping box
     */
    private createClippingBox(center: Vector3, size: Vector3) {
        this._clippingBox = new Box3();
        this._clippingBox.setFromCenterAndSize(center, size);

        if (this._store.isClippingBoxHelperDisplayed()) {
            // First, let's create the helpers for the box itself
            const boxGeometry = new BoxGeometry(size.x, size.y, size.z);
            this._clippingBoxMesh = new Mesh(boxGeometry, helperMaterial);
            this._clippingBoxHelper = new Box3Helper(this._clippingBox, new Color('yellow'));
            this._clippingBoxMesh.renderOrder = 2;
            this._clippingBoxMesh.position.copy(center);
            this._clippingBoxMesh.updateMatrixWorld();
            this._clippingBoxHelper.updateMatrixWorld();

            // Now let's add some controls to move the box
            this._transformControls = new TransformControls(
                this._instance.view.camera,
                this._instance.domElement,
            );
            this._transformControls.addEventListener('change', () => {
                if (
                    this._cameraStore.getNavigationMode() !== 'disabled' ||
                    this._clippingBoxMesh === null
                ) {
                    return;
                }
                // If the change came from the control, let's move the box
                this._store.clippingBoxCenter.copy(this._clippingBoxMesh.position);
                this.moveClippingBox();
            });
            this._transformControls.addEventListener('dragging-changed', event => {
                if (event.value != null) {
                    // Disable controls while we are playing with the transform controls
                    this._previousTransformControls = this._cameraStore.getNavigationMode();
                    this._cameraStore.setNavigationMode('disabled');
                    this._cameraStore.setIsUserInteracting(true);
                } else {
                    this._cameraStore.setNavigationMode(this._previousTransformControls);
                    setTimeout(() => this._cameraStore.setIsUserInteracting(false), 0);
                }
            });

            // And let's add everything in the scene
            this._volumeHelpers.add(this._clippingBoxHelper);
            this._volumeHelpers.add(this._clippingBoxMesh);
            this._transformControls.attach(this._clippingBoxMesh);
            this._transformControls.updateMatrixWorld();
            this._instance.scene.add(this._transformControls);
            this._instance.notifyChange();
        }
    }

    private getPlanesFromBoxSides(): Plane[] {
        if (this._clippingBox === null) {
            throw new Error('No clippingBox defined');
        }

        const result: Plane[] = [];

        // Notice that when the plane has a positive normal, the distance to the box must be negated
        result.push(new Plane(new Vector3(0, 0, +1), -this._clippingBox.min.z));
        result.push(new Plane(new Vector3(0, 0, -1), +this._clippingBox.max.z));
        result.push(new Plane(new Vector3(+1, 0, 0), -this._clippingBox.min.x));
        result.push(new Plane(new Vector3(-1, 0, 0), +this._clippingBox.max.x));
        result.push(new Plane(new Vector3(0, +1, 0), -this._clippingBox.min.y));
        result.push(new Plane(new Vector3(0, -1, 0), +this._clippingBox.max.y));

        if (this._store.isClippingBoxInverted()) {
            result.forEach(plane => plane.negate());
        }

        return result;
    }

    /**
     * Disposes of the clipping box and all helpers
     */
    private disposeClippingBox() {
        this._transformControls?.detach();
        this._transformControls?.removeFromParent();
        this._transformControls?.dispose();

        this._clippingBoxMesh?.geometry?.dispose();
        this._clippingBoxMesh?.removeFromParent();
        this._clippingBoxHelper?.removeFromParent();
        this._clippingBoxHelper?.dispose();

        this._instance.notifyChange();
    }

    /**
     * Applies defined clipping planes to all entities.
     * This is required after:
     * - changing the clipping box
     * - loading a new entity
     */
    private applyClippingPlanes() {
        const planes = this._store.isClippingBoxEnabled() ? this.getPlanesFromBoxSides() : [];
        for (const o of this._datasetStore.getDatasets()) {
            const entity = this._datasetStore.getEntity(o);
            if (entity) {
                entity.clippingPlanes = planes;
                entity.traverseMaterials(mat => {
                    mat.clipIntersection = this._store.isClippingBoxInverted();
                });
                this._instance.notifyChange(entity);
            }
        }
    }

    /**
     * Moves an existing clipping box, while keeping its size
     */
    private moveClippingBox() {
        if (this._store.isClippingBoxEnabled()) {
            if (this._clippingBox === null) {
                this.createClippingBox(this._store.clippingBoxCenter, this._store.clippingBoxSize);
            }

            this._clippingBox?.setFromCenterAndSize(
                this._store.clippingBoxCenter,
                this._store.clippingBoxSize,
            );

            if (this._store.isClippingBoxHelperDisplayed()) {
                this._clippingBoxMesh?.position.copy(this._store.clippingBoxCenter);
                this._clippingBoxMesh?.updateMatrixWorld();
                this._clippingBoxHelper?.updateMatrixWorld();
                this._transformControls?.updateMatrixWorld();
                this._instance.notifyChange(this._volumeHelpers);
                this._instance.notifyChange(this._transformControls);
            }
        }
        this.applyClippingPlanes();
    }

    /**
     * Updates the clipping box; required when changing its size
     */
    private updateClippingBox() {
        this.disposeClippingBox();
        if (this._store.isClippingBoxEnabled()) {
            this.createClippingBox(this._store.clippingBoxCenter, this._store.clippingBoxSize);
        }
        this.applyClippingPlanes();
    }
}
