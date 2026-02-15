import type { Component } from 'vue';

import type { PieroContext } from '@/context';
import type { WidgetStore } from '@/stores/widgets';

export interface Widget {
    component: Component<WidgetProps>;
    id: string;
}

export interface WidgetApi {
    addWidget(widget: Widget): void;
}

export interface WidgetProps {
    context: PieroContext;
}

/** @internal */
export class WidgetApiImpl implements WidgetApi {
    public constructor(private readonly store: WidgetStore) {}

    public addWidget(widget: Widget): void {
        this.store.addWidget(widget);
    }
}
