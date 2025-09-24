import type z from 'zod';

import PointCloud from '@giro3d/giro3d/entities/PointCloud';
import PotreeSource from '@giro3d/giro3d/sources/PotreeSource';

import type { DatasetBuilder } from '@/api/DatasetApi';
import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import { fillObject3DUserData } from '@/loaders/userData';
import { Dataset, Url } from '@/types/configuration';

const PotreeDataset = Dataset.extend({
    url: Url,
});
type PotreeDataset = z.infer<typeof PotreeDataset>;

const builder: DatasetBuilder = context => {
    const dataset = PotreeDataset.parse(context.dataset);

    const entity = new PointCloud({
        source: new PotreeSource({ url: `${dataset.url}` }),
    });

    fillObject3DUserData(entity, {
        filename: dataset.url,
    });

    return Promise.resolve({
        entities: [entity],
    });
};

/**
 * Loads [Potree](https://potree.github.io/) datasets.
 */
export default class PotreeLoader implements Module {
    public readonly id = 'builtin-loader-potree';
    public readonly name = 'Potree';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('potree', {
            builder,
            icon: 'fg-multipoint',
            name: 'Potree Point Cloud',
        });
    }
}
