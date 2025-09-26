import { createPinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Module } from '@/module';

import type { ModuleStore } from './modules';

import { useModuleStore } from './modules';

let store: ModuleStore = useModuleStore(createPinia());

beforeEach(() => {
    store = useModuleStore(createPinia());
});

describe('getLoadedModules', () => {
    it('should return all modules', () => {
        const module1 = {} as Module;
        const module2 = {} as Module;
        const module3 = {} as Module;
        const module4 = {} as Module;

        store.setLoadedModules([module1, module2, module3, module4]);

        const list = store.getLoadedModules();

        expect(list).toEqual([module1, module2, module3, module4]);
    });
});

describe('getModule', () => {
    it('should return the correct module by its ID', () => {
        const module1 = { id: 'foo' } as Module;
        const module2 = { id: 'bar' } as Module;
        const module3 = { id: 'baz' } as Module;
        const module4 = { id: 'qux' } as Module;

        store.setLoadedModules([module1, module2, module3, module4]);

        expect(store.getModule('foo')).toBe(module1);
        expect(store.getModule('bar')).toBe(module2);
        expect(store.getModule('baz')).toBe(module3);
        expect(store.getModule('qux')).toBe(module4);

        expect(store.getModule('nope')).toBeNull();
    });
});
