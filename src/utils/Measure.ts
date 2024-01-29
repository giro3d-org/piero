import { Vector2, Vector3, ShapeUtils } from 'three';
import Drawing from '@giro3d/giro3d/interactions/Drawing.js';

function getPerimeter(coordsOrDrawing: Drawing | Vector3[]) {
    if (!Array.isArray(coordsOrDrawing) && 'isDrawing' in coordsOrDrawing) {
        const coordinates = coordsOrDrawing.coordinates;
        if (coordinates.length < 6) return null;

        let length = 0;
        for (let i = 0; i < coordinates.length / 3 - 1; i += 1) {
            length += new Vector3(
                coordinates[i * 3 + 0],
                coordinates[i * 3 + 1],
                coordinates[i * 3 + 2],
            ).distanceTo(
                new Vector3(
                    coordinates[(i + 1) * 3 + 0],
                    coordinates[(i + 1) * 3 + 1],
                    coordinates[(i + 1) * 3 + 2],
                ),
            );
        }
        return length;
    }

    if (coordsOrDrawing.length < 2) return null;

    let length = 0;
    for (let i = 0; i < coordsOrDrawing.length - 1; i += 1) {
        length += coordsOrDrawing[i].distanceTo(coordsOrDrawing[i + 1]);
    }

    return length;
}

function getMinMaxAltitudes(coordsOrDrawing: Drawing | Vector3[]) {
    let min = +Infinity;
    let max = -Infinity;

    if (!Array.isArray(coordsOrDrawing) && 'isDrawing' in coordsOrDrawing) {
        const coordinates = coordsOrDrawing.coordinates;
        for (let i = 0; i < coordinates.length / 3; i += 1) {
            min = Math.min(min, coordinates[i * 3 + 2]);
            max = Math.max(max, coordinates[i * 3 + 2]);
        }
        return [min, max];
    }

    for (let i = 0; i < coordsOrDrawing.length; i += 1) {
        min = Math.min(min, coordsOrDrawing[i].z);
        max = Math.max(max, coordsOrDrawing[i].z);
    }

    return [min, max];
}

function getArea(coordsOrDrawing: Drawing | Vector2[]) {
    if (!Array.isArray(coordsOrDrawing) && 'isDrawing' in coordsOrDrawing) {
        if (coordsOrDrawing.coordinates.length < 6) return null;
        const local3DCoordinates = coordsOrDrawing.localCoordinates;

        const localCoords = new Array<Vector2>(local3DCoordinates.length / 3);
        for (let i = 0; i < local3DCoordinates.length / 3; i += 1) {
            localCoords[i] = new Vector2(
                local3DCoordinates[i * 3 + 0],
                local3DCoordinates[i * 3 + 1],
            );
        }
        return Math.abs(ShapeUtils.area(localCoords));
    }

    if (coordsOrDrawing.length < 2) return null;

    return Math.abs(ShapeUtils.area(coordsOrDrawing));
}

export default {
    getPerimeter,
    getMinMaxAltitudes,
    getArea,
};
