import type Instance from '@giro3d/giro3d/core/Instance';
import type GUI from 'lil-gui';

import EntityInspector from '@giro3d/giro3d/gui/EntityInspector';

import type IfcEntity from './IfcEntity';

export default class IfcEntityInspector extends EntityInspector<IfcEntity> {
    public constructor(parentGui: GUI, instance: Instance, entity: IfcEntity) {
        super(parentGui, instance, entity, { visibility: true });
    }
}
