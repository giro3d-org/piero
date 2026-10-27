import type { Component } from 'vue';

import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export interface PanelDef {
    component: Component;
    icon: string;
    id: string;
    title: string;
}
export const usePanelStore = defineStore('panels', () => {
    const panels = shallowRef<PanelDef[]>([]);
    const activePanel = shallowRef<PanelDef | null>(null);

    function registerPanel(def: PanelDef): void {
        const ids = new Set(panels.value.map(p => p.id));
        if (ids.has(def.id)) {
            throw new Error(`A panel with the same id has already been registered: ${def.id}`);
        }
        panels.value.push(def);
    }

    function setActivePanel(id: PanelDef['id'] | null): void {
        const panel = panels.value.find(p => p.id === id);
        activePanel.value = panel ?? null;
    }

    return { activePanel, panels, registerPanel, setActivePanel };
});

export type PanelStore = ReturnType<typeof usePanelStore>;
