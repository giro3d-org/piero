import type z from 'zod';

import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';

import type { DatasetBuilder } from '@/api/dataset';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import * as config from '@/configuration';

const Tiles3DDataset = config.dataset.Dataset.extend({
    url: config.url.Url,
});
type Tiles3DDataset = z.infer<typeof Tiles3DDataset>;

const builder: DatasetBuilder = context => {
    const dataset = Tiles3DDataset.parse(context.dataset);

    const entity = new Tiles3D({
        url: dataset.url,
    });

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
