import z from 'zod';

import { Extent } from './extent';

export const BasemapConfiguration = z.object({
    extent: Extent.describe('The extent of the basemap'),
});
export type BasemapConfiguration = z.infer<typeof BasemapConfiguration>;
z.globalRegistry.add(BasemapConfiguration, { id: 'BasemapConfiguration' });
