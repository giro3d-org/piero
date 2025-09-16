import type { Module } from '@/module';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useModuleStore = defineStore('modules', () => {
    const loadedModules = ref<Module[]>([]);

    function setLoadedModules(modules: Module[]) {
        loadedModules.value = modules;
    }

    function getLoadedModules(): Module[] {
        return loadedModules.value;
    }

    return { setLoadedModules, getLoadedModules };
});
