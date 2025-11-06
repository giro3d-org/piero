import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

import type { Widget } from '@/api/WidgetApi';

export const useWidgetStore = defineStore('widgets', () => {
    const widgets = shallowRef<Widget[]>([]);

    function addWidget(widget: Widget): void {
        widgets.value.push(widget);
    }

    function getWidgets(): Widget[] {
        return [...widgets.value];
    }

    return {
        addWidget,
        getWidgets,
    };
});

export type WidgetStore = ReturnType<typeof useWidgetStore>;
