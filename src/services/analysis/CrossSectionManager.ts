import Instance from "@giro3d/giro3d/core/Instance";
import { useAnalysisStore } from '@/stores/analysis';
import { MathUtils, Mesh, MeshStandardMaterial, Plane, PlaneGeometry, PlaneHelper, Vector3 } from "three";

export default class CrossSectionManager {
    private readonly instance: Instance;
    private readonly store = useAnalysisStore();
    private readonly planeHelper : Mesh;

    constructor(instance: Instance) {
        this.instance = instance;
        const material = new MeshStandardMaterial({
            color: 'red',
            opacity: 0.4,
            transparent: true,
        });
        this.planeHelper = new Mesh(new PlaneGeometry(1000, 100), material);
        this.instance.scene.add(this.planeHelper);
        this.planeHelper.name = 'CrossSectionManager - plane';

        this.store.$onAction(({
            name,
            after
        }) => {
            after(() => {
                switch (name) {
                    case 'enableCrossSection':
                    case 'setCrossSectionOrientation':
                    case 'setCrossSectionCenter':
                        this.updateCrossSection();
                        break;
                }
            });
        });
    }

    private updateCrossSection() {
        if (this.store.isCrossSectionEnabled()) {
            const radians = MathUtils.DEG2RAD * this.store.crossSectionOrientation;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            const normal = new Vector3(cos, sin, 0);

            // TODO show plane helper
            this.planeHelper.position.copy(this.store.crossSectionCenter);
            this.planeHelper.lookAt(new Vector3().addVectors(normal, this.store.crossSectionCenter).add(normal));
            this.planeHelper.updateMatrixWorld();

            const distance = new Plane(normal, 0).distanceToPoint(this.store.crossSectionCenter);
            const plane = new Plane(normal, -distance);
            this.instance.renderer.clippingPlanes = [plane];
        } else {
            this.instance.renderer.clippingPlanes = [];
        }
        this.instance.notifyChange();
    }
}