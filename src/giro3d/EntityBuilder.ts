import type { Dataset, DatasetBase } from '@/types/Dataset';
import type { DatasetAsMeshConfig } from '@/types/configuration/datasets';
import type Instance from '@giro3d/giro3d/core/Instance';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

// Note that some builders have a one to one mapping to an entity, whereas other builders
// have a N to one mapping (N dataset types map to a single entity type)
import * as cityjson from './entities/CityJSONEntity';
import * as featureCollection from './entities/FeatureCollectionEntity';
import * as ifc from './entities/IfcEntity';
import * as ply from './entities/PlyEntity';
import * as tiledPointCloud from './entities/TiledPointCloudEntity';
import * as flatPointCloud from './entities/flatPointCloud';
import * as potree from './entities/potree';
import * as tiledIfc from './entities/tiledIfc';
import * as vector from './entities/vector';

export type BuilderContext = { instance: Instance; dataset: Dataset };
export type Builder = (context: BuilderContext) => Promise<Entity3D>;

const builders: Record<string, Builder> = {
    featureCollection: featureCollection.build,
    cityjson: cityjson.build,
    vector: vector.build,
    ifc: ifc.build,
    flatPointcloud: flatPointCloud.build,
    ply: ply.build,
    pointcloud: tiledPointCloud.build,
    potree: potree.build,
    tiledIfc: tiledIfc.build,
};

export function registerEntityBuilder(datasetType: string, builder: Builder) {
    if (builders[datasetType] != null) {
        console.warn(`replacing entity builder for dataset type '${datasetType}'`);
    }

    builders[datasetType] = builder;
}

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

export default {
    getEntity,
};
