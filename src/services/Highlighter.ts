import IfcEntity, { IFCPickResult } from '@/giro3d/IfcEntity';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import Shape, { ShapePickResult } from '@giro3d/giro3d/entities/Shape';
import { isShapePickResult } from './Picker';
import { HIGHLIGHT_SHAPE_COLOR } from '@/constants';
import { Color } from 'three';
import { PieroShapeUserData } from '@/types/Annotation';

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
        const shape = pick.entity as Shape<PieroShapeUserData>;

        if (shape.userData.highlightable) {
            const previousColor = new Color(shape.color);
            shape.color = HIGHLIGHT_SHAPE_COLOR;
            shape.instance.notifyChange();

            this._clearHighlight = () => {
                shape.color = previousColor;
                shape.instance.notifyChange();
            };
        }
    }

    private highlightIFC(pick: IFCPickResult) {
        const mesh = pick.object;
        if (mesh.fragment && pick.face && pick.instanceId !== undefined) {
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
