import PickResult from "@/types/PickResult";
import { Instance } from "@giro3d/giro3d/core";
import { Entity3D } from "@giro3d/giro3d/entities";
import IfcEntity from "@/giro3d/IfcEntity";

export default class Highlighter {
    private readonly instance_: Instance;
    private highlighted: IfcEntity;

    constructor(instance: Instance) {
        this.instance_ = instance;
    }

    clear() {
        if (this.highlighted) this.highlighted.clearHighlight();
    }

    highlightFromPick(pick: PickResult) {
        this.clear();

        const entity = pick.layer as Entity3D;

        if (!entity) {
            return;
        }

        if (entity.isEntity3D && (entity as any)?.isIfcEntity && pick.mesh) {
            const ifcEntity = entity as IfcEntity;
            this.highlighted = ifcEntity;
            ifcEntity.highlight(pick.mesh, pick.itemId);
        }
    }
}
