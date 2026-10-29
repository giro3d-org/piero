import type { PieroContext } from '@/context';
import type { Module } from '@/module';

import AnnotationPanel from './AnnotationPanel.vue';

export default class Annotations implements Module {
    public readonly id = 'builtin-panel-annotations';
    public readonly name = 'Annotations panel';

    public initialize(context: PieroContext): Promise<void> | void {
        context.panels.register({
            component: AnnotationPanel,
            icon: 'bi-vector-pen',
            id: 'annotations',
            title: 'Annotations',
        });
    }
}
