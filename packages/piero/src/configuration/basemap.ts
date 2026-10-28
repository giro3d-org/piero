import z from 'zod';

import { Color } from './color';
import { Extent } from './extent';

export const BasemapConfiguration = z.object({
    background: z
        .optional(z.union([Color, z.null()]))
        .describe(
            'The background color of the terrain (as a CSS-style string), or null to have a transparent background.',
        ),
    extent: Extent.describe('The extent of the basemap'),
});
export type BasemapConfiguration = z.infer<typeof BasemapConfiguration>;
z.globalRegistry.add(BasemapConfiguration, { id: 'BasemapConfiguration' });
