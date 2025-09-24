import z from 'zod';

import { Dataset } from './Dataset';
import { Extent } from './extent';

export const LayerType = z.union([z.literal('color'), z.literal('elevation')]);
export type LayerType = z.infer<typeof LayerType>;

export const Layer = Dataset.extend({
    extent: Extent.optional(),
    layerType: LayerType.optional().default('color'),
    nodata: z.number().optional().describe('The no-data value to enable no-data filling'),
    resolution: z.number().optional().default(1),
});
export type Layer = z.infer<typeof Layer>;
z.globalRegistry.add(Layer, { id: 'Layer' });
