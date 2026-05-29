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

const PointcloudDisplayMode = z.enum(['default', 'intensity', 'elevation']);
type PointcloudDisplayMode = z.infer<typeof PointcloudDisplayMode>;

const Style = z.union([
    z.object({
        displayMode: PointcloudDisplayMode.extract(['default']).optional(),
    }),
    z.object({
        colorMap: ColorMap.default({ max: 100, min: 0, ramp: 'Greys' }),
        displayMode: PointcloudDisplayMode.extract(['elevation', 'intensity']),
    }),
]);

const Tiles3DDataset = config.dataset.Dataset.extend({
    style: Style.optional(),
    url: config.url.Url,
});
type Tiles3DDataset = z.infer<typeof Tiles3DDataset>;

const builder: DatasetBuilder = context => {
    const dataset = Tiles3DDataset.parse(context.dataset);

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
