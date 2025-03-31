import getConfig from '@/config-loader';
import { Dataset } from '@/types/Dataset';
import type {
    DatasetConfigImportable,
    DatasetTypeImportable,
} from '@/types/configuration/datasets';
import type { PointCloudSourceConfig } from '@/types/configuration/datasets/pointCloud';
import type { VectorMeshDatasetSourceConfig } from '@/types/configuration/datasets/vector';
import type { LayerSourceConfig } from '@/types/configuration/layers';
import Fetcher, { type FetchContext, type UrlOrFetchedData } from '@/utils/Fetcher';
import type Instance from '@giro3d/giro3d/core/Instance';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

/** Mapping between file extensions and the dataset types */
const datasetTypePerExtension: Record<string, DatasetTypeImportable> = {
    csv: 'flatPointcloud',
    dsv: 'flatPointcloud',
    geojson: 'vector',
    gpkg: 'vector',
    gpx: 'vector',
    ifc: 'ifc',
    json: 'cityjson',
    kml: 'vector',
    las: 'flatPointcloud',
    laz: 'flatPointcloud',
    tsv: 'flatPointcloud',
} as const;

/** Information on a File */
interface FileInfo extends FetchContext {
    /** Dataset type (if recognized) */
    datasetType?: DatasetTypeImportable;
}

/** Result of import */
export type ImportFileResult = {
    /** Entity created */
    entity: Entity3D;
    /** Dataset created */
    dataset: Dataset;
};

/**
 * Gets the filename and extension from a File or URL
 *
 * @param fileOrUrl - File or URL
 * @returns File name and extension
 */
function getFilename(fileOrUrl: UrlOrFetchedData): FileInfo {
    const context = Fetcher.getContext(fileOrUrl);
    const datasetType =
        context.fileext != null ? datasetTypePerExtension[context.fileext] : undefined;

    return {
        ...context,
        datasetType,
    };
}

/**
 * Loads a file and creates its Entity3D and Dataset.
 *
 * @param instance - Giro3D instance
 * @param file - File to load
 * @returns Created objects
 * @throws `Error` if file cannot be imported (unsupported, etc.)
 */
async function importFile(instance: Instance, file: File): Promise<Dataset> {
    const config = getConfig();
    const fileinfo = getFilename(file);

    if (fileinfo.filename == null || fileinfo.fileext == null) {
        throw new Error('Could not determine filename');
    }
    if (fileinfo.datasetType == null) {
        throw new Error(`File ${fileinfo.fileext} not supported`);
    }

    let datasetConfig: DatasetConfigImportable;

    const commonConfig = {
        name: fileinfo.filename,
        visible: true,
    };

    switch (fileinfo.datasetType) {
        case 'cityjson':
            datasetConfig = {
                ...commonConfig,
                type: 'cityjson',
                source: {
                    url: file,
                },
            };
            break;
        case 'ifc':
            datasetConfig = {
                ...commonConfig,
                type: 'ifc',
                source: {
                    url: file,
                },
            };
            break;
        case 'flatPointcloud': {
            let fileType: PointCloudSourceConfig['type'];
            switch (fileinfo.fileext) {
                case 'csv':
                    fileType = 'csv';
                    break;
                case 'las':
                case 'laz':
                    // Note that COPC files do not have a specified extension.
                    // `.copc.laz` is just a convention.
                    if (fileinfo.filename.endsWith('.copc.laz')) {
                        fileType = 'copc';
                    } else {
                        fileType = 'las';
                    }
                    break;
                default:
                    throw new Error(`File ${fileinfo.fileext} not supported`);
            }
            datasetConfig = {
                ...commonConfig,
                type: 'flatPointcloud',
                source: {
                    type: fileType,
                    url: file,
                },
            };
            break;
        }
        case 'vector': {
            switch (config.importedVectorDatasetRendering) {
                case 'overlay': {
                    let fileType: LayerSourceConfig['type'];
                    switch (fileinfo.fileext) {
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
                            throw new Error(`File ${fileinfo.fileext} not supported`);
                    }
                    datasetConfig = {
                        ...commonConfig,
                        type: 'colorLayer',
                        source: {
                            type: fileType,
                            url: file,
                            style: 'default',
                        },
                    };
                    break;
                }
                default: {
                    let fileType: VectorMeshDatasetSourceConfig['type'];
                    switch (fileinfo.fileext) {
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
                            throw new Error(`File ${fileinfo.fileext} not supported`);
                    }
                    datasetConfig = {
                        ...commonConfig,
                        type: fileinfo.datasetType,
                        rendering: config.importedVectorDatasetRendering,
                        source: {
                            type: fileType,
                            url: file,
                            fetchElevation: true,
                        },
                    };
                }
            }
            break;
        }
        case 'colorLayer': {
            let fileType: LayerSourceConfig['type'];
            switch (fileinfo.fileext) {
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
                    throw new Error(`File ${fileinfo.fileext} not supported`);
            }
            datasetConfig = {
                ...commonConfig,
                type: 'colorLayer',
                source: {
                    type: fileType,
                    url: file,
                    style: 'default',
                },
            };
            break;
        }
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = fileinfo.datasetType;
            return _exhaustiveCheck;
        }
    }

    return new Dataset(datasetConfig);
}

export default {
    importFile,
};
