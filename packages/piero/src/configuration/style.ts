import type { FlatStyle, FlatStyleLike, Rule } from 'ol/style/flat';
import type { StyleLike } from 'ol/style/Style';

import { flatStylesToStyleFunction, rulesToStyleFunction } from 'ol/render/canvas/style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import z from 'zod';

export const OpenLayersFlatStyleLike = z.unknown();
export type OpenLayersFlatStyleLike = FlatStyleLike;

export function toOpenLayersStyle(input: OpenLayersFlatStyleLike): StyleLike {
    if (!Array.isArray(input)) {
        return flatStylesToStyleFunction([input]);
    } else if (input.length === 0) {
        return [];
    } else if ('style' in input[0]) {
        // It's a rule array
        return rulesToStyleFunction(input as Rule[]);
    } else {
        return flatStylesToStyleFunction(input as FlatStyle[]);
    }
}

export const defaultVectorStyle: Style = new Style({
    fill: new Fill({
        color: '#377c5fa1',
    }),
    stroke: new Stroke({
        color: '#123e2bff',
        width: 2,
    }),
});
