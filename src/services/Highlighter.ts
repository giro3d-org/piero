import PickResult from "@/types/PickResult";
import { Instance } from "@giro3d/giro3d/core";
import { Entity3D } from "@giro3d/giro3d/entities";
import { Material, Mesh, MeshBasicMaterial } from "three";
import * as ifc from "three/examples/jsm/loaders/IFCLoader";

export default class Highlighter {
    private readonly instance_ : Instance;
    private highlighted: Mesh;

    constructor(instance: Instance) {
        this.instance_ = instance;
    }

    clear() {
        if (this.highlighted) {
            this.highlighted.geometry.dispose();
            this.highlighted.removeFromParent();
            this.highlighted = null;
        }
    }

    highlightFromPick(pick: PickResult) {
        const entity = pick.layer as Entity3D;

        if (!entity) {
            return;
        }

        this.clear();

        if (entity.isEntity3D && entity.object3d.modelID !== undefined) {
            const ifcModel = entity.object3d as ifc.IFCModel;
            const id = ifcModel.ifcManager.getExpressId(ifcModel.geometry, pick.faceIndex);

            this.highlighted = ifcModel.ifcManager.createSubset({
                modelID: ifcModel.modelID,
                ids: [id],
                removePrevious: false,
                scene: ifcModel,
                material: new MeshBasicMaterial({ color: 'red', depthTest: false, depthWrite: true, transparent: true }),
            }) as Mesh;

            if (this.highlighted) {
                this.highlighted.renderOrder = 10;
                this.highlighted.updateMatrixWorld(true);
                this.instance_.notifyChange();
            }
        }
    }
}
