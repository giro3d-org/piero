import type { PointCloudDatasetConfig } from '@/types/configuration/datasets/pointCloud';

import type { LoadDatasetFromFile } from './loader';

export const load: LoadDatasetFromFile<PointCloudDatasetConfig> = context => {
    return {
        name: context.filename,
        visible: true,
        type: 'flatPointcloud',
        source: {
            type: 'csv',
            url: context.file,
        },
    } as PointCloudDatasetConfig;
};
