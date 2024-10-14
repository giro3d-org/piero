import type Instance from '@giro3d/giro3d/core/Instance';
import EntityInspector from '@giro3d/giro3d/gui/EntityInspector';
import type GUI from 'lil-gui';
import type IfcEntity from './entities/IfcEntity';

export default class IfcEntityInspector extends EntityInspector<IfcEntity> {
    constructor(parentGui: GUI, instance: Instance, entity: IfcEntity) {
        super(parentGui, instance, entity, { visibility: true });
    }
}
