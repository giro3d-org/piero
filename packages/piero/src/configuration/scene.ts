/* eslint-disable perfectionist/sort-objects */
import z from 'zod';

import { BasemapConfiguration } from './basemap';
import { CrsName } from './crs';
import { LookAt } from './lookAt';

export const SceneConfiguration = z.object({
    crs: CrsName.optional().default('EPSG:3857'),

    camera: LookAt.describe('The initial configuration of the camera.'),

    basemap: BasemapConfiguration.describe('The configuration for the basemap and terrain.'),
});
export type SceneConfiguration = z.input<typeof SceneConfiguration>;
export type SceneConfigurationOutput = z.infer<typeof SceneConfiguration>;
z.globalRegistry.add(SceneConfiguration, { id: 'SceneConfiguration' });
