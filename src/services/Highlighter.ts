import IfcEntity from '@/giro3d/IfcEntity';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';

export default class Highlighter {
    private _highlighted: IfcEntity | null;

    constructor() {
        this._highlighted = null;
    }

    dispose() {
        this.clear();
    }

    clear() {
        if (this._highlighted) this._highlighted.clearHighlight();
    }

    highlightFromPick(pick: PickResult) {
        this.clear();

        if (!pick.entity) {
            return;
        }

        if (IfcEntity.isIFCPickResult(pick)) {
            const mesh = pick.object;
            if (mesh.fragment && pick.face && pick.instanceId !== undefined) {
                const blockId = mesh.fragment.getVertexBlockID(mesh.geometry, pick.face.a);

                const itemId = mesh.fragment
                    .getItemID(pick.instanceId, blockId)
                    .replace(/\..*/, '');
                this._highlighted = pick.entity;
                pick.entity.highlight('selection', mesh, itemId);
            }
        }
    }
}
