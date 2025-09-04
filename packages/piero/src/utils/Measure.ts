import type Shape from '@giro3d/giro3d/entities/Shape';
import type { Vector3 } from 'three';

function getMinMaxAltitudes(coordsOrDrawing: Shape | Vector3[]): [number, number] {
    let min = +Infinity;
    let max = -Infinity;

    let points: Readonly<Vector3[]>;

    if (Array.isArray(coordsOrDrawing)) {
        points = coordsOrDrawing;
    } else {
        points = coordsOrDrawing.points;
    }

    for (let i = 0; i < points.length; i += 1) {
        min = Math.min(min, points[i].z);
        max = Math.max(max, points[i].z);
    }

    return [min, max];
}

export default {
    getMinMaxAltitudes,
};
