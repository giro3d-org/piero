import type { IFCDatasetConfig } from '@/types/configuration/datasets/ifc';
import type { LoadDatasetFromFile } from './loader';

export const load: LoadDatasetFromFile<IFCDatasetConfig> = context => {
    return {
        name: context.filename,
        visible: true,
        type: 'ifc',
        source: {
            url: context.file,
        },
    } as IFCDatasetConfig;
};
