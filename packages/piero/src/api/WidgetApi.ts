import type { Component } from 'vue';

import type { PieroContext } from '@/context';
import type { WidgetStore } from '@/stores/widgets';

export interface Widget {
    component: Component<{ context: PieroContext }>;
    id: string;
}

export class WidgetApiImpl implements WidgetApi {
    public constructor(private readonly store: WidgetStore) {}

    public addWidget(widget: Widget): void {
        this.store.addWidget(widget);
    }
}

export default interface WidgetApi {
    addWidget(widget: Widget): void;
}
