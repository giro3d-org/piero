import type { TiledIfcDatasetConfig } from '@/types/configuration/datasets/tiledIfc';

import { getPublicFolderUrl } from '@/utils/Configuration';

import type { EntityBuilder } from '../EntityBuilder';

import Tiles3dEntity from './Tiles3dEntity';

export const build: EntityBuilder = context => {
    const cfg = context.dataset.config as TiledIfcDatasetConfig;
    const entity = new Tiles3dEntity({
        ...cfg.source,
        url: getPublicFolderUrl(cfg.source.url),
    });
    // Hide some elements that don't bring visual value
    entity.addEventListener('object-created', evt => {
        const scene = evt.obj;
        scene.traverse(obj => {
            if (obj.userData?.class === 'IfcSpace') {
                obj.visible = false;
            }
        });
    });

    return Promise.resolve(entity);
};
