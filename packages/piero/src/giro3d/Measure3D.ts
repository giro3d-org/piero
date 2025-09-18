import type { LineLabelFormatter } from '@giro3d/giro3d/entities/Shape';
import type { Vector3 } from 'three';

import Shape from '@giro3d/giro3d/entities/Shape';

import type Measure from '@/types/Measure';

import { DEFAULT_MEASURE_COLOR, HIGHLIGHT_MEASURE_COLOR } from '@/constants';
import { isObject } from '@/utils/Types';

const lengthFormat = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    style: 'unit',
    unit: 'meter',
    unitDisplay: 'short',
});

const formatLength: LineLabelFormatter = values => {
    return `${lengthFormat.format(values.length)}`;
};

export type MeasureUserData = {
    measure: Measure;
    highlightable: true;
    highlightColor: typeof HIGHLIGHT_MEASURE_COLOR;
};

class Measure3D extends Shape<MeasureUserData> {
    public readonly isMeasure3D = true as const;

    public get from(): Vector3 {
        return this.points[0];
    }
    public get to(): Vector3 {
        return this.points[1];
    }
    public get length(): number {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.getLength()!;
    }

    public constructor() {
        super({
            showLineLabel: true,
            color: DEFAULT_MEASURE_COLOR,
            lineLabelFormatter: formatLength,
        });

        this.userData.highlightable = true;
        this.userData.highlightColor = HIGHLIGHT_MEASURE_COLOR;

        this.depthTest = true;
    }

    public copy(source: this): this {
        this.setPoints([source.from, source.to]);
        return this;
    }

    public clone(): Measure3D {
        return new Measure3D().copy(this);
    }

    public static isMeasure3D = (obj: unknown): obj is Measure3D =>
        isObject(obj) && (obj as Measure3D).isMeasure3D;
}

export default Measure3D;
