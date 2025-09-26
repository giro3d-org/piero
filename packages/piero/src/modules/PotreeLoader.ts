import PointCloud from '@giro3d/giro3d/entities/PointCloud';
import PotreeSource from '@giro3d/giro3d/sources/PotreeSource';

import type { PieroContext } from '@/context';
import type { EntityBuilder } from '@/giro3d/EntityBuilder';
import type { Module } from '@/module';
import type { PotreePointCloudDatasetConfig } from '@/types/configuration/datasets/potreePointCloud';

import { fillObject3DUserData } from '@/loaders/userData';

const entityBuilder: EntityBuilder = context => {
    const cfg = context.dataset.config as PotreePointCloudDatasetConfig;

    const entity = new PointCloud({
        source: new PotreeSource({ url: `${cfg.source.url}/${cfg.source.filename}` }),
    });

    fillObject3DUserData(entity, {
        filename: cfg.source.url,
    });

    return Promise.resolve(entity);
};

/**
 * Loads [Potree](https://potree.github.io/) datasets.
 */
export default class PotreeLoader implements Module {
    public readonly id = 'builtin-potree-loader';
    public readonly name = 'Potree';

    public initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('potree', {
            entityBuilder,
            icon: 'fg-multipoint',
            name: 'Potree Point Cloud',
        });
    }
}
