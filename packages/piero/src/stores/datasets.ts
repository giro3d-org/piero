import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type { Ref } from 'vue';

import { defineStore } from 'pinia';
import { Box3 } from 'three';
import { computed, ref, shallowReactive } from 'vue';

import type { DatasetActionRegistrationParams } from '@/api';

import { getConfig } from '@/config-loader';
import {
    type Dataset,
    type DatasetLayer,
    type DatasetOrGroup,
    parseDatasetConfig,
} from '@/types/Dataset';

type DatasetAction = DatasetActionRegistrationParams & {
    mustBeVisible: boolean;
};

function buildDatasets(root: DatasetOrGroup): DatasetOrGroup {
    // We have multiple levels or shallowReactive-ness because we want to react to:
    // 1. Changes in the root properties (visible, isPreloading, etc.)
    const ds = shallowReactive(root);
    if (ds.type === 'group') {
        // 2. To the list of children (in case we add/delete datasets)
        // 3. To the children themselves (see 1.)
        ds.children = shallowReactive(ds.children.map(c => buildDatasets(c)));
    }
    return ds;
}

export const useDatasetStore = defineStore('datasets', () => {
    const config = getConfig();
    const datasets = shallowReactive(
        parseDatasetConfig(config.datasets).map(ds => buildDatasets(ds)),
    );
    const leafs = computed(() => datasets.map(c => c.leafs()).flat());
    const count = computed(() => leafs.value.length);

    const entities: Map<string, Entity3D> = new Map();
    const layers: Map<string, DatasetLayer> = new Map();

    const customActions: Ref<DatasetAction[]> = ref([]);

    function registerCustomAction(params: DatasetActionRegistrationParams): void {
        customActions.value = [
            ...customActions.value,
            {
                ...params,
                mustBeVisible: params.mustBeVisible ?? false,
            },
        ];
    }

    /** Get hierarchy of datasets & groups */
    function getTree(): DatasetOrGroup[] {
        return datasets;
    }

    /** Get leaf datasets */
    function getDatasets(): Dataset[] {
        return leafs.value;
    }

    /** Adds a dataset at the end of the tree */
    function add(ds: DatasetOrGroup): DatasetOrGroup {
        const dataset = shallowReactive(ds);
        datasets.push(dataset);
        return dataset;
    }

    /** Binds an entity to a dataset */
    function attachEntity(ds: DatasetOrGroup, entity: Entity3D): void {
        entities.set(ds.uuid, entity);
    }

    /** Binds a layer to a dataset */
    function attachLayer(ds: DatasetOrGroup, layer: DatasetLayer): void {
        layers.set(ds.uuid, layer);
    }

    /** Removes a dataset from the hierarchy */
    function remove(ds: DatasetOrGroup): void {
        const list = ds.parent != null ? ds.parent.children : datasets;
        list.splice(list.indexOf(ds), 1);
    }

    /**
     * Gets the bounding box of a dataset or group.
     *
     * For a group, the bounding box is the union of its *loaded* datasets.
     *
     * @returns Bounding box - can be empty
     */
    function getBoundingBox(dataset: DatasetOrGroup): Box3 {
        const box = new Box3();
        dataset.traverse(ds => {
            const entity = entities.get(ds.uuid);
            const localBox = entity?.getBoundingBox();
            if (localBox && !localBox.isEmpty()) {
                box.union(localBox);
                return;
            }

            const layer = layers.get(ds.uuid);
            const layerExtent = layer?.getExtent()?.as(config.default_crs);
            if (layerExtent && layerExtent.isValid()) {
                const localBox = layerExtent.toBox3(0, 0);
                box.union(localBox);
                return;
            }
        });
        return box;
    }

    /** Gets the entity attached to a dataset (if bound) */
    function getEntity(ds: DatasetOrGroup): Entity3D | undefined {
        return entities.get(ds.uuid);
    }

    /** Gets the layer attached to a dataset (if bound) */
    function getLayer(ds: DatasetOrGroup): DatasetLayer | undefined {
        return layers.get(ds.uuid);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function importFromFile(file: File | string): void {
        // Nothing to do, rely on action listeners.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function setVisible(ds: DatasetOrGroup, newVisibility: boolean): void {
        // Nothing to do, rely on action listeners.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function toggleGrid(ds: DatasetOrGroup): void {
        // Nothing to do, rely on action listeners.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function toggleMask(ds: DatasetOrGroup): void {
        // Nothing to do, rely on action listeners.
    }

    function getCustomActions(
        dataset: DatasetOrGroup,
        params: { isVisible: boolean },
    ): DatasetAction[] {
        const actions = customActions.value;

        return actions.filter(item => {
            if (item.predicate != null && !item.predicate(dataset)) {
                return false;
            }

            if (item.mustBeVisible && !params.isVisible) {
                return false;
            }

            return true;
        });
    }

    return {
        add,
        attachEntity,
        attachLayer,
        count,
        getBoundingBox,
        getCustomActions,
        getDatasets,
        getEntity,
        getLayer,
        getTree,
        importFromFile,
        registerCustomAction,
        remove,
        setVisible,
        toggleGrid,
        toggleMask,
    };
});

export type DatasetStore = ReturnType<typeof useDatasetStore>;
