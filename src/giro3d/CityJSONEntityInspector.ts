import type Instance from '@giro3d/giro3d/core/Instance';
import EntityInspector from '@giro3d/giro3d/gui/EntityInspector';
import type GUI from 'lil-gui';
import type CityJSONEntity from './entities/CityJSONEntity';

export default class CityJSONEntityInspector extends EntityInspector<CityJSONEntity> {
    availableLods: string;

    constructor(parentGui: GUI, instance: Instance, entity: CityJSONEntity) {
        super(parentGui, instance, entity, { visibility: true });

        this.availableLods = entity.availableLods ? entity.availableLods.join('; ') : '';

        this.addController(this, 'availableLods').name('Available LoDs');
        this.addController(this.entity, 'displayedLodIdx')
            .name('Displayed LoD index')
            .min(-1)
            .max((entity.availableLods?.length ?? 0) - 1)
            .step(1);

        this.addController(this.entity, 'showSemantics').name('Show semantics');
    }
}
