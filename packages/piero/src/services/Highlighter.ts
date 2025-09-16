import type { MeasureUserData } from '@/giro3d/Measure3D';
import type { PieroShapeUserData } from '@/types/Annotation';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import type Shape from '@giro3d/giro3d/entities/Shape';
import type { ShapePickResult } from '@giro3d/giro3d/entities/Shape';
import { isShapePickResult } from '@giro3d/giro3d/entities/Shape';
import { Color } from 'three';

export type ClearHighlightFn = () => void;
export type HighlightFn = (obj: PickResult) => ClearHighlightFn | null;

export const customHighlighters: HighlightFn[] = [];

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

    highlightFromPick(pick: PickResult) {
        this.clear();

        if (!pick.entity) {
            return;
        }

        if (isShapePickResult(pick)) {
            this.highlightShape(pick);
        }

        for (const highlighter of customHighlighters) {
            const clearHighlight = highlighter(pick);
            if (clearHighlight) {
                this._clearHighlight = clearHighlight;
            }
        }
    }
}
