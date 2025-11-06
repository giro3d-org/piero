import type Instance from '@giro3d/giro3d/core/Instance';
import type Entity from '@giro3d/giro3d/entities/Entity';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import { isEntity3D } from '@giro3d/giro3d/entities/Entity3D';

import type { PieroContext } from '@/context';
import type { Module } from '@/module';

export type PostProcessing = (entity: Entity3D, context: { instance: Instance }) => void;

const hideIfcSpace: PostProcessing = entity => {
    entity.addEventListener('object-created', evt => {
        const scene = evt.obj;
        scene.traverse(obj => {
            if (obj.userData?.class === 'IfcSpace') {
                obj.visible = false;
            }
        });
    });
};

export default class PostProcessEntities implements Module {
    public readonly id = 'builtin-post-process-entities';
    public readonly name = 'Post-process 3D Tiles';

    private readonly _alreadyProcessedEntities = new Set<Entity['id']>();

    private readonly _processings = [hideIfcSpace];

    public initialize(context: PieroContext): Promise<void> | void {
        context.events.addEventListener('ready', () => {
            const instance = context.view.getInstance();
            instance.addEventListener('entity-added', () => this.processEntities(instance));

            // Initial processing
            this.processEntities(instance);
        });
    }

    private processEntities(instance: Instance): void {
        for (const entity of instance.getEntities()) {
            if (this._alreadyProcessedEntities.has(entity.id)) {
                continue;
            }

            if (isEntity3D(entity)) {
                this.processEntity(entity, instance);
            }

            this._alreadyProcessedEntities.add(entity.id);
        }
    }

    private processEntity(entity: Entity3D, instance: Instance): void {
        const context = { instance };

        for (const processing of this._processings) {
            processing(entity, context);
        }
    }
}
