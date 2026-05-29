import type { Tiles3DOptions } from '@giro3d/giro3d/entities/Tiles3D';

import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import { MODE } from '@giro3d/giro3d/renderer/PointCloudMaterial';
import z from 'zod';

import type { DatasetBuilder } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import * as config from '@/configuration';
import { ColorMap } from '@/configuration/colormap';
import { toGiro3DColorMap } from '@/utils/Configuration';

export const PointcloudDisplayModeSchema = z.enum(['default', 'intensity', 'elevation']);
export type PointcloudDisplayModeSchema = z.infer<typeof PointcloudDisplayModeSchema>;

export const StyleSchema = z.union([
    z.object({
        displayMode: PointcloudDisplayModeSchema.extract(['default']).optional(),
    }),
    z.object({
        colorMap: ColorMap.default({ max: 100, min: 0, ramp: 'Greys' }),
        displayMode: PointcloudDisplayModeSchema.extract(['elevation', 'intensity']),
    }),
]);

export const Tiles3DDatasetSchema = config.dataset.Dataset.extend({
    style: StyleSchema.optional(),
    type: z.literal('3dtiles'),
    url: config.url.Url,
});
/**
 * 3D Tiles dataset configuration.
 */
export type Tiles3DDataset = z.infer<typeof Tiles3DDatasetSchema>;

const builder: DatasetBuilder = context => {
    const dataset = Tiles3DDatasetSchema.parse(context.dataset);

    const config: Tiles3DOptions = {
        url: dataset.url,
    };

    switch (dataset.style?.displayMode) {
        case 'elevation':
            config.pointCloudMode = MODE.ELEVATION;
            break;
        case 'intensity':
            config.pointCloudMode = MODE.INTENSITY;
            break;
        case 'default':
        default:
            config.pointCloudMode = MODE.COLOR;
            break;
    }

    if (dataset.style != null && 'colorMap' in dataset.style && dataset.style.colorMap != null) {
        config.colorMap = toGiro3DColorMap(dataset.style.colorMap);
    }

    const entity = new Tiles3D(config);

    return Promise.resolve({
        entities: [entity],
    });
};

/**
 * Add support for the [3D Tiles](https://www.ogc.org/standards/3dtiles/) tilesets.
 *
 * See  {@link Tiles3DDataset} for configurating 3D Tiles datasets.
 */
export default class Tiles3DLoader implements Module {
    public readonly id = 'builtin-loader-3dtiles';
    public readonly name = '3D Tiles';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('3dtiles', {
            builder,
            icon: 'fg-3dtiles-file',
            name: '3D Tiles',
        });
    }
}
