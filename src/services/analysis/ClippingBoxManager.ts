import { Box3, Box3Helper, BoxGeometry, Color, Group, Mesh, MeshBasicMaterial, Plane, Vector3 } from "three";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Instance from "@giro3d/giro3d/core/Instance";
import { useAnalysisStore } from '@/stores/analysis';
import { useDatasetStore } from "@/stores/datasets";
import { useCameraStore } from "@/stores/camera";
import NavigationMode from "@/types/NavigationMode";

const helperMaterial = new MeshBasicMaterial({ color: 'yellow', opacity: 0.1, transparent: true });

export default class ClippingBoxManager {
    private readonly instance: Instance;
    private volumeHelpers: Group;
    private clippingBox: Box3 | null;
    private clippingBoxHelper: Box3Helper | null;
    private clippingBoxMesh: Mesh | null;
    private transformControls: TransformControls | null;
    private previousTransformControls: NavigationMode;

    private readonly store = useAnalysisStore();
    private readonly cameraStore = useCameraStore();
    private readonly datasetStore = useDatasetStore();

    constructor(instance: Instance) {
        this.instance = instance;
        this.volumeHelpers = new Group();
        instance.scene.add(this.volumeHelpers);

        this.clippingBox = null;
        this.clippingBoxHelper = null;
        this.clippingBoxMesh = null;
        this.transformControls = null;
        this.previousTransformControls = this.cameraStore.getNavigationMode();

        this.store.$onAction(({
            name,
            after
        }) => {
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

        this.datasetStore.$onAction(({
            name,
            after
        }) => {
            after(() => {
                switch (name) {
                    case 'attachEntity':
                        this.applyClippingPlanes();
                        break;
                }
            });
        });
    }

    /**
     * Creates the whole clipping box and helpers if displayed
     * @param center Center of the clipping box
     * @param size Size of the clipping box
     */
    private createClippingBox(center: Vector3, size: Vector3) {
        this.clippingBox = new Box3();
        this.clippingBox.setFromCenterAndSize(center, size);

        if (this.store.isClippingBoxHelperDisplayed()) {
            // First, let's create the helpers for the box itself
            const boxGeometry = new BoxGeometry(size.x, size.y, size.z);
            this.clippingBoxMesh = new Mesh(boxGeometry, helperMaterial);
            this.clippingBoxHelper = new Box3Helper(this.clippingBox, new Color('yellow'));
            this.clippingBoxMesh.renderOrder = 2;
            this.clippingBoxMesh.position.copy(center);
            this.clippingBoxMesh.updateMatrixWorld();
            this.clippingBoxHelper.updateMatrixWorld();

            // Now let's add some controls to move the box
            this.transformControls = new TransformControls(this.instance.camera.camera3D, this.instance.domElement);
            this.transformControls.addEventListener('change', () => {
                if (this.cameraStore.getNavigationMode() !== "disabled" || this.clippingBoxMesh === null) return;
                // If the change came from the control, let's move the box
                this.store.clippingBoxCenter.copy(this.clippingBoxMesh.position);
                this.moveClippingBox();
            });
            this.transformControls.addEventListener('dragging-changed', (event) => {
                if (event.value) {
                    // Disable controls while we are playing with the transform controls
                    this.previousTransformControls = this.cameraStore.getNavigationMode();
                    this.cameraStore.setNavigationMode("disabled");
                    this.cameraStore.setIsUserInteracting(true);
                } else {
                    this.cameraStore.setNavigationMode(this.previousTransformControls);
                    setTimeout(() => this.cameraStore.setIsUserInteracting(false), 0);
                }
            });

            // And let's add everything in the scene
            this.volumeHelpers.add(this.clippingBoxHelper);
            this.volumeHelpers.add(this.clippingBoxMesh);
            this.transformControls.attach(this.clippingBoxMesh);
            this.transformControls.updateMatrixWorld();
            this.instance.scene.add(this.transformControls);
            this.instance.notifyChange();
        }
    }

    private getPlanesFromBoxSides(): Plane[] {
        if (this.clippingBox === null) throw new Error('No clippingBox defined');

        const result: Plane[] = [];

        // Notice that when the plane has a positive normal, the distance to the box must be negated
        result.push(new Plane(new Vector3(0, 0, +1), -this.clippingBox.min.z));
        result.push(new Plane(new Vector3(0, 0, -1), +this.clippingBox.max.z));
        result.push(new Plane(new Vector3(+1, 0, 0), -this.clippingBox.min.x));
        result.push(new Plane(new Vector3(-1, 0, 0), +this.clippingBox.max.x));
        result.push(new Plane(new Vector3(0, +1, 0), -this.clippingBox.min.y));
        result.push(new Plane(new Vector3(0, -1, 0), +this.clippingBox.max.y));

        if (this.store.isClippingBoxInverted()) {
            result.forEach(plane => plane.negate());
        }

        return result;
    }

    /**
     * Disposes of the clipping box and all helpers
     */
    private disposeClippingBox() {
        this.transformControls?.detach();
        this.transformControls?.removeFromParent();
        this.transformControls?.dispose();

        this.clippingBoxMesh?.geometry?.dispose();
        this.clippingBoxMesh?.removeFromParent();
        this.clippingBoxHelper?.removeFromParent();
        this.clippingBoxHelper?.dispose();

        this.instance.notifyChange();
    }

    /**
     * Applies defined clipping planes to all entities.
     * This is required after:
     * - changing the clipping box
     * - loading a new entity
     */
    private applyClippingPlanes() {
        const planes = this.store.isClippingBoxEnabled() ? this.getPlanesFromBoxSides() : [];
        for (const o of this.datasetStore.getDatasets()) {
            const entity = this.datasetStore.getEntity(o);
            if (entity) {
                entity.clippingPlanes = planes;
                entity.traverseMaterials(mat => { mat.clipIntersection = this.store.isClippingBoxInverted(); });
                this.instance.notifyChange(entity);
            }
        }
    }

    /**
     * Moves an existing clipping box, while keeping its size
     */
    private moveClippingBox() {
        if (this.store.isClippingBoxEnabled()) {
            if (this.clippingBox === null) {
                this.createClippingBox(this.store.clippingBoxCenter, this.store.clippingBoxSize);
            }

            this.clippingBox?.setFromCenterAndSize(this.store.clippingBoxCenter, this.store.clippingBoxSize);

            if (this.store.isClippingBoxHelperDisplayed()) {
                this.clippingBoxMesh?.position.copy(this.store.clippingBoxCenter);
                this.clippingBoxMesh?.updateMatrixWorld();
                this.clippingBoxHelper?.updateMatrixWorld();
                this.transformControls?.updateMatrixWorld();
                this.instance.notifyChange(this.volumeHelpers);
                this.instance.notifyChange(this.transformControls);
            }
        }
        this.applyClippingPlanes();
    }

    /**
     * Updates the clipping box; required when changing its size
     */
    private updateClippingBox() {
        this.disposeClippingBox();
        if (this.store.isClippingBoxEnabled()) {
            this.createClippingBox(this.store.clippingBoxCenter, this.store.clippingBoxSize);
        }
        this.applyClippingPlanes();
    }
}
