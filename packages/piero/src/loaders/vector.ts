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
        case 'json':
        case 'geojson':
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
        visible: true,
        type: 'colorLayer',
        source: {
            type: fileType,
            url: context.file,
            style: 'default',
        },
    } satisfies ColorLayerDatasetConfig;
};

const loadMesh: LoadDatasetFromFile<
    VectorMeshDatasetConfig | VectorShapeDatasetConfig | VectorLabelsDatasetConfig
> = context => {
    let fileType: VectorMeshDatasetSourceConfig['type'];
    switch (context.extension) {
        case 'json':
        case 'geojson':
            fileType = 'geojson';
            break;
        case 'gpx':
            fileType = 'gpx';
            break;
        case 'kml':
            fileType = 'kml';
            break;
        case 'gpkg':
            fileType = 'geopackage';
            break;
        default:
            throw new Error(`File extension '${context.extension}' not supported`);
    }

    return {
        name: context.filename,
        visible: true,
        type: 'vector',
        rendering: context.configuration.importedVectorDatasetRendering as VectorDatasetRendering,
        source: {
            type: fileType,
            url: context.file,
            fetchElevation: true,
        },
    } satisfies VectorMeshDatasetConfig | VectorShapeDatasetConfig | VectorLabelsDatasetConfig;
};

export const load: LoadDatasetFromFile<
    | VectorMeshDatasetConfig
    | VectorShapeDatasetConfig
    | VectorLabelsDatasetConfig
    | ColorLayerDatasetConfig
> = context => {
    if (context.configuration.importedVectorDatasetRendering === 'overlay') {
        return loadOverlay(context);
    }

    return loadMesh(context);
};
