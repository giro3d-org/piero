import EntityInspector from '@giro3d/giro3d/gui/EntityInspector';
import IfcEntity from './IfcEntity';
import GUI from 'lil-gui';
import Instance from '@giro3d/giro3d/core/Instance';

export default class IfcEntityInspector extends EntityInspector<IfcEntity> {
    constructor(parentGui: GUI, instance: Instance, entity: IfcEntity) {
        super(parentGui, instance, entity, { visibility: true });
    }
}
