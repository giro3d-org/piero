import type { EntityBuilder } from '../EntityBuilder';

import * as tiledGeom from './tiledGeom';

export const build: EntityBuilder = async context => {
    const entity = await tiledGeom.build(context);
    // Hide some elements that don't bring visual value
    entity.addEventListener('object-created', evt => {
        const scene = evt.obj;
        scene.traverse(obj => {
            if (obj.userData?.class === 'IfcSpace') {
                obj.visible = false;
            }
        });
    });
    return entity;
};
