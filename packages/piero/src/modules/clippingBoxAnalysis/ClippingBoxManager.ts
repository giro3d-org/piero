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
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import type { PieroContext } from '@/context';
import type { DatasetOrGroup } from '@/types/Dataset';
import type NavigationMode from '@/types/NavigationMode';

import { useCameraStore } from '@/stores/camera';
import { useDatasetStore } from '@/stores/datasets';

import { useClippingBoxStore } from './store';

const helperMaterial = new MeshBasicMaterial({ color: 'yellow', opacity: 0.1, transparent: true });

export default class ClippingBoxManager {
    private readonly _cameraStore = useCameraStore();
    private _clippingBox: Box3 | null = null;
    private _clippingBoxHelper: Box3Helper | null = null;
    private _clippingBoxMesh: Mesh | null = null;
    private readonly _datasetStore = useDatasetStore();

    private _previousTransformControls: NavigationMode = this._cameraStore.getNavigationMode();
    private readonly _store = useClippingBoxStore();
    private _transformControls: TransformControls | null = null;

    private readonly _volumeHelpers: Group = new Group();

    public constructor(private readonly context: PieroContext) {
        context.events.addEventListener('ready', this.initialize.bind(this));
    }

    public clipToDataset(dataset: DatasetOrGroup): void {
        const box = this._datasetStore.getBoundingBox(dataset);
        if (!box?.isEmpty()) {
            this.setClippingBox(box);
        }
    }

    public dispose(): void {
        this.context.view.getInstance().scene.remove(this._volumeHelpers);
        this.disposeClippingBox();
    }

    public isClippingBoxEnabled(): boolean {
        return this._store.enable;
    }

    public setClippingBox(box: Box3): void {
        if (!box.isEmpty()) {
            this._store.setClippingBox(box);
            this._store.setEnabled(true);
        }
    }

    /**
     * Applies defined clipping planes to all entities.
     * This is required after:
     * - changing the clipping box
     * - loading a new entity
     */
    private applyClippingPlanes(): void {
        const planes = this._store.enable ? this.getPlanesFromBoxSides() : [];
        for (const o of this._datasetStore.getDatasets()) {
            const entity = this._datasetStore.getEntity(o);
            if (entity) {
                entity.clippingPlanes = planes;
                entity.traverseMaterials(mat => {
                    mat.clipIntersection = this._store.invert;
                });
                this.context.view.getInstance().notifyChange(entity);
            }
        }
    }

    /**
     * Creates the whole clipping box and helpers if displayed
     * @param center - Center of the clipping box
     * @param size - Size of the clipping box
     */
    private createClippingBox(center: Vector3, size: Vector3): void {
        this._clippingBox = new Box3();
        this._clippingBox.setFromCenterAndSize(center, size);

        const instance = this.context.view.getInstance();

        if (this._store.displayHelper) {
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
                instance.view.camera,
                instance.domElement,
            );
            this._transformControls.addEventListener('change', () => {
                if (
                    this._cameraStore.getNavigationMode() !== 'disabled' ||
                    this._clippingBoxMesh === null
                ) {
                    return;
                }
                // If the change came from the control, let's move the box
                this._store.center.copy(this._clippingBoxMesh.position);
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
            this._transformControls.getHelper().updateMatrixWorld();
            instance.scene.add(this._transformControls.getHelper());
            instance.notifyChange();
        }
    }

    /**
     * Disposes of the clipping box and all helpers
     */
    private disposeClippingBox(): void {
        this._transformControls?.detach();
        this._transformControls?.getHelper().removeFromParent();
        this._transformControls?.dispose();

        this._clippingBoxMesh?.geometry?.dispose();
        this._clippingBoxMesh?.removeFromParent();
        this._clippingBoxHelper?.removeFromParent();
        this._clippingBoxHelper?.dispose();

        this.context.view.getInstance().notifyChange();
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

        if (this._store.invert) {
            result.forEach(plane => plane.negate());
        }

        return result;
    }

    private initialize(): void {
        const instance = this.context.view.getInstance();

        instance.scene.add(this._volumeHelpers);

        this._clippingBox = null;
        this._clippingBoxHelper = null;
        this._clippingBoxMesh = null;
        this._transformControls = null;
        this._previousTransformControls = this._cameraStore.getNavigationMode();

        this._store.$onAction(({ after, name }) => {
            after(() => {
                switch (name) {
                    case 'setCenter':
                        // We can simply move the existing box
                        this.moveClippingBox();
                        break;
                    case 'setClippingBox':
                    case 'setDisplayHelper':
                    case 'setEnabled':
                    case 'setSize':
                        // Need to recreate the whole box
                        this.updateClippingBox();
                        break;
                    case 'setInverted':
                        this.applyClippingPlanes();
                        break;
                }
            });
        });

        this._datasetStore.$onAction(({ after, name }) => {
            after(() => {
                switch (name) {
                    case 'attachEntity':
                        if (this._store.enable) {
                            this.applyClippingPlanes();
                        }
                        break;
                }
            });
        });
    }

    /**
     * Moves an existing clipping box, while keeping its size
     */
    private moveClippingBox(): void {
        const instance = this.context.view.getInstance();

        if (this._store.enable) {
            if (this._clippingBox === null) {
                this.createClippingBox(this._store.center, this._store.size);
            }

            this._clippingBox?.setFromCenterAndSize(this._store.center, this._store.size);

            if (this._store.displayHelper) {
                this._clippingBoxMesh?.position.copy(this._store.center);
                this._clippingBoxMesh?.updateMatrixWorld();
                this._clippingBoxHelper?.updateMatrixWorld();
                this._transformControls?.getHelper().updateMatrixWorld();
                instance.notifyChange(this._volumeHelpers);
                instance.notifyChange(this._transformControls);
            }
        }
        this.applyClippingPlanes();
    }

    /**
     * Updates the clipping box; required when changing its size
     */
    private updateClippingBox(): void {
        this.disposeClippingBox();
        if (this._store.enable) {
            this.createClippingBox(this._store.center, this._store.size);
        }
        this.applyClippingPlanes();
    }
}
