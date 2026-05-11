import type { FlatStyleLike } from 'ol/style/flat';

import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import z from 'zod';

export const OpenLayersFlatStyleLike = z.unknown();
export type OpenLayersFlatStyleLike = FlatStyleLike;

export const defaultVectorStyle: Style = new Style({
    fill: new Fill({
        color: '#377c5fa1',
    }),
    stroke: new Stroke({
        color: '#123e2bff',
        width: 2,
    }),
});
