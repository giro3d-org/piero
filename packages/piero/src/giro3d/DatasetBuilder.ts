import type Instance from '@giro3d/giro3d/core/Instance';

import type { DatasetBuildContext, DatasetBuilder, DatasetBuildResult } from '@/api/DatasetApi';
import type { DatasetOrGroup } from '@/types/configuration';
import type { Dataset, DatasetBase } from '@/types/Dataset';

const builders: Record<Dataset['type'], DatasetBuilder> = {};

/**
 * Gets the Giro3D entity for a dataset
 * @param instance - Giro3D main instance
 * @param dataset - Dataset
 * @returns Entity
 */
async function build(
    instance: Instance,
    dataset: Dataset & DatasetBase<DatasetOrGroup>,
): Promise<DatasetBuildResult> {
    const context: DatasetBuildContext = {
        dataset: dataset.config,
        instance,
    };

    const builder = builders[dataset.type];

    if (builder == null) {
        throw new Error(
            `no builder found for dataset type <span class="badge text-bg-secondary">${dataset.type}</span>`,
        );
    }

    const result = await builder(context);

    if (result.entities) {
        for (const entity of result.entities) {
            if (!('dataset' in entity.object3d.userData)) {
                entity.object3d.userData.dataset = {};
            }
            entity.object3d.userData.dataset.name = dataset.name;
        }
    }

    return result;
}

export function registerBuilder(datasetType: string, builder: DatasetBuilder): void {
    if (builders[datasetType] != null) {
        console.warn(`replacing builder for dataset type '${datasetType}'`);
    }

    builders[datasetType] = builder;
}

export default {
    build,
};
