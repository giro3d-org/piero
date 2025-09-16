import type { PieroContext } from '@/context';
import type { EntityBuilder } from '@/giro3d/EntityBuilder';
import { fillObject3DUserData } from '@/loaders/userData';
import type { Module } from '@/module';
import type { PotreePointCloudDatasetConfig } from '@/types/configuration/datasets/potreePointCloud';
import PointCloud from '@giro3d/giro3d/entities/PointCloud';
import PotreeSource from '@giro3d/giro3d/sources/PotreeSource';

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
    readonly name = 'Potree';

    initialize(context: PieroContext): Promise<void> | void {
        context.datasets.registerDatasetType('potree', {
            name: 'Potree Point Cloud',
            icon: 'fg-multipoint',
            entityBuilder,
        });
    }
}
