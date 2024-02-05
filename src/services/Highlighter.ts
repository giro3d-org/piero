import { FragmentMesh } from 'bim-fragment/fragment-mesh';
import { Instance } from '@giro3d/giro3d/core';
import IfcEntity from '@/giro3d/IfcEntity';
import PickResult from '@giro3d/giro3d/core/picking/PickResult';

export default class Highlighter {
    private readonly instance_: Instance;
    private highlighted: IfcEntity | null;

    constructor(instance: Instance) {
        this.instance_ = instance;
        this.highlighted = null;
    }

    clear() {
        if (this.highlighted) this.highlighted.clearHighlight();
    }

    highlightFromPick(pick: PickResult) {
        this.clear();

        if (!pick.entity) {
            return;
        }

        if (IfcEntity.isIFCEntity(pick.entity)) {
            const mesh = pick.object as FragmentMesh;
            if (mesh.fragment) {
                const blockId = mesh.fragment.getVertexBlockID(
                    mesh.geometry,
                    (pick as any).face?.a,
                );

                const itemId = mesh.fragment
                    .getItemID((pick as any).instanceId, blockId)
                    .replace(/\..*/, '');
                this.highlighted = pick.entity;
                pick.entity.highlight('selection', mesh, itemId);
            }
        }
    }
}
