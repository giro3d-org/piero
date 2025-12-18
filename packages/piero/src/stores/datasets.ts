import type Layer from '@giro3d/giro3d/core/layer/Layer';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type { Ref } from 'vue';

import { defineStore } from 'pinia';
import { Box3 } from 'three';
import { computed, ref, shallowReactive } from 'vue';

import type { DatasetActionRegistrationParams } from '@/api';
import type { Configuration } from '@/types/configuration';

import { getConfig } from '@/configurationLoader';
import { Datagroup, type Dataset, type DatasetOrGroup, parseDatasetConfig } from '@/types/Dataset';

type DatasetAction = DatasetActionRegistrationParams & {
    mustBePreloaded: boolean;
    mustBeVisible: boolean;
};

function assignZOrders(roots: DatasetOrGroup[]): void {
    const context = { z: 0 };

    for (const root of roots) {
        if (Datagroup.isGroup(root)) {
            root.traverse(ds => {
                context.z++;
                ds.zOrder = context.z;
            });
        } else {
            context.z++;
            root.zOrder = context.z;
        }
    }
}

function buildDatasets(root: DatasetOrGroup): DatasetOrGroup {
    // We have multiple levels or shallowReactive-ness because we want to react to:
    // 1. Changes in the root properties (visible, isPreloading, etc.)
    const ds = shallowReactive(root);
    if (Datagroup.isGroup(ds)) {
        // 2. To the list of children (in case we add/delete datasets)
        // 3. To the children themselves (see 1.)
        ds.children = shallowReactive(ds.children.map(c => buildDatasets(c)));
    }
    return ds;
}

function loadDatasets(config: Configuration): DatasetOrGroup[] {
    const roots = parseDatasetConfig(config.data ?? []);

    assignZOrders(roots);

    return roots;
}

export const useDatasetStore = defineStore('datasets', () => {
    const config = getConfig();
    const datasets = shallowReactive(loadDatasets(config).map(ds => buildDatasets(ds)));
    const leafs = computed(() => datasets.map(c => c.leafs()).flat());
    const count = computed(() => leafs.value.length);

    const entities: Map<string, Entity3D[]> = new Map();
    const layers: Map<string, Layer[]> = new Map();

    const customActions: Ref<DatasetAction[]> = ref([]);

    function registerCustomAction(params: DatasetActionRegistrationParams): void {
        customActions.value = [
            ...customActions.value,
            {
                ...params,
                mustBePreloaded: params.mustBePreloaded ?? false,
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

    function getVisibleDatasets(): Dataset[] {
        return leafs.value.filter(ds => ds.visible && !Datagroup.isGroup(ds));
    }

    /** Adds a dataset at the end of the tree */
    function add(ds: DatasetOrGroup): DatasetOrGroup {
        const dataset = shallowReactive(ds);
        datasets.push(dataset);
        return dataset;
    }

    /** Binds an entity to a dataset */
    function attachEntities(ds: DatasetOrGroup, entityList: Entity3D[]): void {
        entities.set(ds.uuid, entityList);
    }

    /** Binds a layer to a dataset */
    function attachLayers(ds: DatasetOrGroup, layerList: Layer[]): void {
        layers.set(ds.uuid, layerList);
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
            const list = entities.get(ds.uuid);

            list?.forEach(entity => {
                const localBox = entity?.getBoundingBox();
                if (localBox && !localBox.isEmpty()) {
                    box.union(localBox);
                }
            });

            const layerList = layers.get(ds.uuid);
            if (layerList) {
                for (const layer of layerList) {
                    const layerExtent = layer?.getExtent()?.as(config.scene.crs);
                    if (layerExtent && layerExtent.isValid()) {
                        const localBox = layerExtent.toBox3(0, 0);
                        box.union(localBox);
                        return;
                    }
                }
            }
        });

        return box;
    }

    /** Gets the entity attached to a dataset (if bound) */
    function getEntities(ds: DatasetOrGroup): Entity3D[] | undefined {
        return entities.get(ds.uuid);
    }

    /** Gets the layer attached to a dataset (if bound) */
    function getLayers(ds: DatasetOrGroup): Layer[] | undefined {
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
    function setOpacity(ds: Dataset, newOpacity: number): void {
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
        params: { isPreloaded: boolean; isVisible: boolean },
    ): DatasetAction[] {
        const actions = customActions.value;

        return actions.filter(item => {
            if (item.predicate != null && !item.predicate(dataset)) {
                return false;
            }

            if (item.mustBeVisible && !params.isVisible) {
                return false;
            }

            if (item.mustBePreloaded && !params.isPreloaded) {
                return false;
            }

            return true;
        });
    }

    return {
        add,
        attachEntities,
        attachLayers,
        count,
        datasets,
        getBoundingBox,
        getCustomActions,
        getDatasets,
        getEntities,
        getLayers,
        getTree,
        getVisibleDatasets,
        importFromFile,
        registerCustomAction,
        remove,
        setOpacity,
        setVisible,
        toggleGrid,
        toggleMask,
    };
});

export type DatasetStore = ReturnType<typeof useDatasetStore>;
