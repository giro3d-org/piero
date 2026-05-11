import z from 'zod';

import { Dataset } from './dataset';
import { Extent } from './extent';

export const LayerType = z.union([z.literal('color'), z.literal('elevation')]);

/**
 * Extends {@link Dataset} with layer-specific properties.
 * A layer is a dataset that is draped on the basemap.
 */
export interface Layer extends Dataset {
    extent?: Extent;
    layerType?: LayerType;
    nodata?: number;
    resolution?: number;
}

export type LayerType = z.infer<typeof LayerType>;

export const Layer = Dataset.extend({
    /**
     * The layer spatial extent.
     */
    extent: Extent.optional(),
    layerType: LayerType.optional().default('color'),
    nodata: z.number().optional().describe('The no-data value to enable no-data filling'),
    /**
     * The layer resolution.
     */
    resolution: z.number().optional().default(1),
});
z.globalRegistry.add(Layer, { id: 'Layer' });
