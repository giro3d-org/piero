import type { ColorLayerDatasetConfig } from '@/types/configuration/datasets/layer';
import type { LayerSourceConfig } from '@/types/configuration/layers';

import type { LoadDatasetFromFile } from './loader';

const loadOverlay: LoadDatasetFromFile<ColorLayerDatasetConfig> = context => {
    let fileType: LayerSourceConfig['type'];
    switch (context.extension) {
        case 'tif':
        case 'tiff':
            fileType = 'cog';
            break;
        default:
            throw new Error(`File extension '${context.extension}' not supported`);
    }

    if (context.file instanceof File) {
        throw new Error(`Import of files not supported yet`);
    }

    return {
        name: context.filename,
        source: {
            projection: context.configuration.default_crs,
            type: fileType,
            url: context.file,
        },
        type: 'colorLayer',
        visible: true,
    } satisfies ColorLayerDatasetConfig;
};

export const load: LoadDatasetFromFile<ColorLayerDatasetConfig> = context => {
    return loadOverlay(context);
};
