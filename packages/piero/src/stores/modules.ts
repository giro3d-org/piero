import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

import type { Module } from '@/module';

export const useModuleStore = defineStore('modules', () => {
    const loadedModules = shallowRef<Module[]>([]);

    function setLoadedModules(modules: Module[]): void {
        loadedModules.value = modules;
    }

    function getLoadedModules(): Module[] {
        return loadedModules.value;
    }

    function getModule<T extends Module>(id: Module['id']): T | null {
        for (const module of loadedModules.value) {
            if (module.id === id) {
                return module as T;
            }
        }

        return null;
    }

    return { getLoadedModules, getModule, setLoadedModules };
});

export type ModuleStore = ReturnType<typeof useModuleStore>;
