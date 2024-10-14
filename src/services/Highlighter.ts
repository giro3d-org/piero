import type { MeasureUserData } from '@/giro3d/Measure3D';
import IfcEntity, { type IFCPickResult } from '@/giro3d/entities/IfcEntity';
import type { PieroShapeUserData } from '@/types/Annotation';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import type Shape from '@giro3d/giro3d/entities/Shape';
import type { ShapePickResult } from '@giro3d/giro3d/entities/Shape';
import { isShapePickResult } from '@giro3d/giro3d/entities/Shape';
import { Color } from 'three';

export default class Highlighter {
    private _clearHighlight: (() => void) | null = null;

    dispose() {
        this.clear();
    }

    clear() {
        if (this._clearHighlight) {
            this._clearHighlight();
            this._clearHighlight = null;
        }
    }

    private highlightShape(pick: ShapePickResult) {
        const shape = pick.entity as Shape<PieroShapeUserData | MeasureUserData>;

        if (shape.userData.highlightable) {
            const previousColor = new Color(shape.color);
            shape.color = shape.userData.highlightColor;
            shape.instance.notifyChange();

            this._clearHighlight = () => {
                shape.color = previousColor;
                shape.instance.notifyChange();
            };
        }
    }

    private highlightIFC(pick: IFCPickResult) {
        const mesh = pick.object;
        if (mesh.fragment != null && pick.face && pick.instanceId != null) {
            const blockId = mesh.fragment.getVertexBlockID(mesh.geometry, pick.face.a);

            const itemId = mesh.fragment.getItemID(pick.instanceId, blockId).replace(/\..*/, '');
            this._clearHighlight = () => pick.entity.clearHighlight();
            pick.entity.highlight('selection', mesh, itemId);
        }
    }

    highlightFromPick(pick: PickResult) {
        this.clear();

        if (!pick.entity) {
            return;
        }

        if (IfcEntity.isIFCPickResult(pick)) {
            this.highlightIFC(pick);
        } else if (isShapePickResult(pick)) {
            this.highlightShape(pick);
        }
    }
}
