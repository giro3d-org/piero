import type { CityJSONDatasetConfig } from '@/types/configuration/datasets/cityjson';
import type { LoadDatasetFromFile } from './loader';

export const load: LoadDatasetFromFile<CityJSONDatasetConfig> = context => {
    return {
        name: context.filename,
        visible: true,
        type: 'cityjson',
        source: {
            url: context.file,
        },
    } as CityJSONDatasetConfig;
};
