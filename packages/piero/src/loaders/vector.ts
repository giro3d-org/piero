import type { ColorLayerDatasetConfig } from '@/types/configuration/datasets/layer';
import type {
    VectorDatasetRendering,
    VectorLabelsDatasetConfig,
    VectorMeshDatasetConfig,
    VectorMeshDatasetSourceConfig,
    VectorShapeDatasetConfig,
} from '@/types/configuration/datasets/vector';
import type { LayerSourceConfig } from '@/types/configuration/layers';

import type { LoadDatasetFromFile } from './loader';

const loadOverlay: LoadDatasetFromFile<ColorLayerDatasetConfig> = context => {
    let fileType: LayerSourceConfig['type'];
    switch (context.extension) {
        case 'geojson':
        case 'json':
            fileType = 'geojson';
            break;
        case 'gpx':
            fileType = 'gpx';
            break;
        case 'kml':
            fileType = 'kml';
            break;
        default:
            throw new Error(`File extension '${context.extension}' not supported`);
    }

    return {
        name: context.filename,
        source: {
            style: 'default',
            type: fileType,
            url: context.file,
        },
        type: 'colorLayer',
        visible: true,
    } satisfies ColorLayerDatasetConfig;
};

const loadMesh: LoadDatasetFromFile<
    VectorLabelsDatasetConfig | VectorMeshDatasetConfig | VectorShapeDatasetConfig
> = context => {
    let fileType: VectorMeshDatasetSourceConfig['type'];
    switch (context.extension) {
        case 'geojson':
        case 'json':
            fileType = 'geojson';
            break;
        case 'gpkg':
            fileType = 'geopackage';
            break;
        case 'gpx':
            fileType = 'gpx';
            break;
        case 'kml':
            fileType = 'kml';
            break;
        default:
            throw new Error(`File extension '${context.extension}' not supported`);
    }

    return {
        name: context.filename,
        rendering: context.configuration.importedVectorDatasetRendering as VectorDatasetRendering,
        source: {
            fetchElevation: context.configuration.importedMeshDatasetFetchElevation ?? true,
            fetchElevationFast:
                context.configuration.importedMeshDatasetFetchElevationFast ?? false,
            type: fileType,
            url: context.file,
        },
        type: 'vector',
        visible: true,
    } satisfies VectorLabelsDatasetConfig | VectorMeshDatasetConfig | VectorShapeDatasetConfig;
};

export const load: LoadDatasetFromFile<
    | ColorLayerDatasetConfig
    | VectorLabelsDatasetConfig
    | VectorMeshDatasetConfig
    | VectorShapeDatasetConfig
> = context => {
    if (context.configuration.importedVectorDatasetRendering === 'overlay') {
        return loadOverlay(context);
    }

    return loadMesh(context);
};
