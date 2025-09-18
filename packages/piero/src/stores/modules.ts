import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Module } from '@/module';

export const useModuleStore = defineStore('modules', () => {
    const loadedModules = ref<Module[]>([]);

    function setLoadedModules(modules: Module[]): void {
        loadedModules.value = modules;
    }

    function getLoadedModules(): Module[] {
        return loadedModules.value;
    }

    return { setLoadedModules, getLoadedModules };
});
