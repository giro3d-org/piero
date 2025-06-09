import type { TiledIfcDatasetConfig } from '@/types/configuration/datasets/tiledIfc';
import { getPublicFolderUrl } from '@/utils/Configuration';
import type { Builder } from '../EntityBuilder';
import Tiles3dEntity from './Tiles3dEntity';

export const build: Builder = context => {
    const cfg = context.dataset.config as TiledIfcDatasetConfig;
    const entity = new Tiles3dEntity({
        ...cfg.source,
        url: getPublicFolderUrl(cfg.source.url),
    });

    return Promise.resolve(entity);
};
