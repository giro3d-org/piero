import getConfig from '@/config-loader';
import {
    parseDatasetConfig,
    type Dataset,
    type DatasetLayer,
    type DatasetOrGroup,
} from '@/types/Dataset';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import { defineStore } from 'pinia';
import { Box3 } from 'three';
import { computed, shallowReactive } from 'vue';

function buildDatasets(root: DatasetOrGroup) {
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
        const list = ds.parent ? ds.parent.children : datasets;
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
    function importFromFile(file: File): void {
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

    return {
        count,
        getTree,
        getDatasets,
        add,
        remove,
        importFromFile,
        setVisible,
        getBoundingBox,
        getEntity,
        getLayer,
        attachEntity,
        attachLayer,
        toggleGrid,
        toggleMask,
    };
});
