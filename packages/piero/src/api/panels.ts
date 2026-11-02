import type { Component } from 'vue';

import type { PanelStore } from '@/stores/panels';

export interface PanelApi {
    register(params: {
        component: Component;
        icon: string;
        id: string;
        location?: 'bottom' | 'top';
        title?: string;
    }): void;
}

/** @internal */
export class PanelApiImpl implements PanelApi {
    public constructor(private readonly store: PanelStore) {}

    public register(params: {
        component: Component;
        icon: string;
        id: string;
        location?: 'bottom' | 'top';
        title?: string;
    }): void {
        this.store.registerPanel({
            component: params.component,
            icon: params.icon,
            id: params.id,
            location: params.location ?? 'top',
            title: params.title ?? params.id,
        });
    }
}
