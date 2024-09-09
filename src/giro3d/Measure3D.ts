import Measure from '@/types/Measure';
import { isObject } from '@/utils/Types';
import Shape, { LineLabelFormatter, ShapePickResult } from '@giro3d/giro3d/entities/Shape';

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
};

class Measure3D extends Shape<MeasureUserData> {
    public readonly isMeasure3D = true as const;
    public readonly isPickableFeatures = true as const;

    get from() {
        return this.points[0];
    }
    get to() {
        return this.points[1];
    }
    get length() {
        return this.getLength()!;
    }

    pick(): ShapePickResult[] {
        return [];
    }

    constructor() {
        super({
            showLineLabel: true,
            color: 'yellow',
            lineLabelFormatter: formatLength,
        });

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
