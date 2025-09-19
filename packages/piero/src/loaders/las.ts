import type { PointCloudDatasetConfig } from '@/types/configuration/datasets/pointCloud';

import type { LoadDatasetFromFile } from './loader';

export const load: LoadDatasetFromFile<PointCloudDatasetConfig> = context => {
    return {
        name: context.filename,
        source: {
            // Note that COPC files do not have a specified extension.
            // `.copc.laz` is just a convention.
            type: context.filename.endsWith('.copc.laz') ? 'copc' : 'las',
            url: context.file,
        },
        type: 'flatPointcloud',
        visible: true,
    } as PointCloudDatasetConfig;
};
