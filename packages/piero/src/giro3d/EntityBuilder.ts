import type Instance from '@giro3d/giro3d/core/Instance';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import type { DatasetAsMeshConfig } from '@/types/configuration/datasets';
import type { Dataset, DatasetBase } from '@/types/Dataset';

// Note that some builders have a one to one mapping to an entity, whereas other builders
// have a N to one mapping (N dataset types map to a single entity type)
import * as featureCollection from './entities/FeatureCollectionEntity';
import * as flatPointCloud from './entities/flatPointCloud';
import * as tiledIfc from './entities/tiledIfc';
import * as tiledPointCloud from './entities/TiledPointCloudEntity';
import * as vector from './entities/vector';

export type BuilderContext = { dataset: Dataset; instance: Instance };
export type EntityBuilder = (context: BuilderContext) => Promise<Entity3D>;

const builders: Record<string, EntityBuilder> = {
    featureCollection: featureCollection.build,
    flatPointcloud: flatPointCloud.build,
    pointcloud: tiledPointCloud.build,
    tiledIfc: tiledIfc.build,
    vector: vector.build,
};

/**
 * Gets the Giro3D entity for a dataset
 * @param instance - Giro3D main instance
 * @param dataset - Dataset
 * @returns Entity
 */
async function getEntity(
    instance: Instance,
    dataset: Dataset & DatasetBase<DatasetAsMeshConfig>,
): Promise<Entity3D> {
    const context: BuilderContext = {
        dataset,
        instance,
    };

    const builder = builders[dataset.type];

    if (builder == null) {
        throw new Error(`no entity builder found for dataset type '${dataset.type}'`);
    }

    const entity = await builder(context);

    if (!('dataset' in entity.object3d.userData)) {
        entity.object3d.userData.dataset = {};
    }

    entity.object3d.userData.dataset.name = dataset.name;

    return entity;
}

export function registerEntityBuilder(datasetType: string, builder: EntityBuilder): void {
    if (builders[datasetType] != null) {
        console.warn(`replacing entity builder for dataset type '${datasetType}'`);
    }

    builders[datasetType] = builder;
}

export default {
    getEntity,
};
