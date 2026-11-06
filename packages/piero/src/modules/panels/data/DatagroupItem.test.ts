import type { Mock } from 'vitest';
import type { Component } from 'vue';

import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { beforeEach, expect, it, vi } from 'vitest';

import { useDatasetPanelStore } from '@/stores/datasetPanel';
import { Datagroup } from '@/types/Dataset';

import DatagroupItem from './DatagroupItem.vue';
import DatasetOrGroupItem from './DatasetOrGroupItem.vue';

vi.mock('@/stores/datasets', () => ({
    useDatasetStore: (): {} => ({}),
}));

let group: Datagroup;

beforeEach(() => {
    group = new Datagroup({
        children: [
            {
                name: 'a',
                type: 'testType',
            },
            {
                name: 'ab',
                type: 'testType',
            },
            {
                name: 'abc',
                type: 'testType',
            },
            {
                name: 'bcda',
                type: 'testTypeB',
            },
        ],
        name: 'my group',
        type: 'group',
        visible: true,
    });
});

it.for([true, false])('filters all children if %s', value => {
    // tests that all child elements of a datagroup have filter(...) called
    const childMocks: Mock[] = [];

    const pinia = createPinia();
    const datasetPanelStore = useDatasetPanelStore(pinia);
    datasetPanelStore.setExpanded(group.uuid, true);

    const datasetOrGroupItemStub: Component = {
        props: ['dataset'],
        setup(props, { expose }) {
            const m = vi.fn().mockReturnValue(value);
            childMocks.push(m);
            expose({
                filter: m,
            });
        },
        template: '<div />',
    };
    const wrapper = mount(DatagroupItem, {
        global: {
            stubs: {
                DatasetOrGroupItem: datasetOrGroupItemStub,
            },
        },
        props: {
            group: group,
        },
    });

    const children = wrapper.findAllComponents(DatasetOrGroupItem);

    expect(children.length).toBe(childMocks.length);
    expect(children.length).toBe(4);

    wrapper.vm.filter('', 'all-types', []);
    wrapper.vm.filter('a', 'all-types', []);
    wrapper.vm.filter('ab', 'all-types', []);
    wrapper.vm.filter('c', 'testType', []);
    wrapper.vm.filter('c', 'testTypeB', []);
    wrapper.vm.filter('', 'testTypeB', []);

    for (const m of childMocks) {
        expect(m).toHaveBeenCalledTimes(6);
    }
});
