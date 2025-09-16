import { DEFAULT_MEASURE_COLOR, HIGHLIGHT_MEASURE_COLOR } from '@/constants';
import type Measure from '@/types/Measure';
import { isObject } from '@/utils/Types';
import type { LineLabelFormatter } from '@giro3d/giro3d/entities/Shape';
import Shape from '@giro3d/giro3d/entities/Shape';

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

    get from() {
        return this.points[0];
    }
    get to() {
        return this.points[1];
    }
    get length() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.getLength()!;
    }

    constructor() {
        super({
            showLineLabel: true,
            color: DEFAULT_MEASURE_COLOR,
            lineLabelFormatter: formatLength,
        });

        this.userData.highlightable = true;
        this.userData.highlightColor = HIGHLIGHT_MEASURE_COLOR;

        this.depthTest = true;
    }

    copy(source: this): this {
        this.setPoints([source.from, source.to]);
        return this;
    }

    clone(): Measure3D {
        return new Measure3D().copy(this);
    }

    static isMeasure3D = (obj: unknown): obj is Measure3D =>
        isObject(obj) && (obj as Measure3D).isMeasure3D;
}

export default Measure3D;
