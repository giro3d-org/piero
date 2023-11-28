import { Vector2, Vector3, ShapeUtils } from 'three';
import Drawing from '@giro3d/giro3d/interactions/Drawing.js';

function getPerimeter(coords: Drawing | Vector3[]) {
    if (coords instanceof Drawing) {
        if (coords.coordinates.length < 6) return null;

        let length = 0;
        for (let i = 0; i < coords.coordinates.length / 3 - 1; i += 1) {
            length += new Vector3(
                coords.coordinates[i * 3 + 0],
                coords.coordinates[i * 3 + 1],
                coords.coordinates[i * 3 + 2],
            ).distanceTo(
                new Vector3(
                    coords.coordinates[(i + 1) * 3 + 0],
                    coords.coordinates[(i + 1) * 3 + 1],
                    coords.coordinates[(i + 1) * 3 + 2],
                ),
            );
        }
        return length;
    }

    if (coords.length < 2) return null;

    let length = 0;
    for (let i = 0; i < coords.length - 1; i += 1) {
        length += coords[i].distanceTo(coords[i + 1]);
    }

    return length;
}

function getMinMaxAltitudes(coords: Drawing | Vector3[]) {
    let min = +Infinity;
    let max = -Infinity;

    if (coords instanceof Drawing) {
        for (let i = 0; i < coords.coordinates.length / 3; i += 1) {
            min = Math.min(min, coords.coordinates[i * 3 + 2]);
            max = Math.max(max, coords.coordinates[i * 3 + 2]);
        }
        return [min, max];
    }

    for (let i = 0; i < coords.length; i += 1) {
        min = Math.min(min, coords[i].z);
        max = Math.max(max, coords[i].z);
    }

    return [min, max];
}

function getArea(coords: Drawing | Vector2[]) {
    if (coords instanceof Drawing) {
        if (coords.coordinates.length < 6) return null;

        const localCoords = new Array(coords.coordinates.length / 3);
        for (let i = 0; i < coords.coordinates.length / 3; i += 1) {
            localCoords[i] = new Vector2(
                coords.positionsTop[i * 3 + 0],
                coords.positionsTop[i * 3 + 1],
            );
        }
        return Math.abs(ShapeUtils.area(localCoords));
    }

    if (coords.length < 2) return null;

    return Math.abs(ShapeUtils.area(coords));
}

export default {
    getPerimeter,
    getMinMaxAltitudes,
    getArea,
};
