import { fillObject3DUserData } from '@/loaders/userData';
import type { PotreePointCloudDatasetConfig } from '@/types/configuration/datasets/potreePointCloud';
import PointCloud from '@giro3d/giro3d/entities/PointCloud';
import PotreeSource from '@giro3d/giro3d/sources/PotreeSource';
import type { Builder } from '../EntityBuilder';

export const build: Builder = context => {
    const cfg = context.dataset.config as PotreePointCloudDatasetConfig;

    const entity = new PointCloud({
        source: new PotreeSource({ url: `${cfg.source.url}/${cfg.source.filename}` }),
    });

    fillObject3DUserData(entity, {
        filename: cfg.source.url,
    });

    return Promise.resolve(entity);
};
