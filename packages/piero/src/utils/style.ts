import type { FlatStyle, Rule } from 'ol/style/flat';
import type { StyleLike } from 'ol/style/Style';

import { flatStylesToStyleFunction, rulesToStyleFunction } from 'ol/render/canvas/style';

import type { OpenLayersFlatStyleLike } from '@/configuration/style';

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
