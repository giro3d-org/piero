import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type Instance from '@giro3d/giro3d/core/Instance';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import MaskLayer from '@giro3d/giro3d/core/layer/MaskLayer';

import config from '@/config';
import LayerBuilder from '@/giro3d/LayerBuilder';
import type {
    DatasetAsLayerConfig,
    DatasetAsMeshesConfig,
    DatasetConfigImportable,
    DatasetTypeImportable,
} from '@/types/configuration/datasets';
import type { BDTopoDatasetConfig } from '@/types/configuration/datasets/bdtopo';
import type { CityJSONDatasetConfig } from '@/types/configuration/datasets/cityjson';
import type { CSVPointCloudDatasetConfig } from '@/types/configuration/datasets/csvPointCloud';
import type { GeoJSONAsMeshDatasetConfig } from '@/types/configuration/datasets/geojson';
import type { GeopackageDatasetConfig } from '@/types/configuration/datasets/geopackage';
import type { GPXAsMeshDatasetConfig } from '@/types/configuration/datasets/gpx';
import type { IFCDatasetConfig } from '@/types/configuration/datasets/ifc';
import type { KMLAsMeshDatasetConfig } from '@/types/configuration/datasets/kml';
import type { LASDatasetConfig } from '@/types/configuration/datasets/las';
import type { PLYDatasetConfig } from '@/types/configuration/datasets/ply';
import type { PotreePointCloudDatasetConfig } from '@/types/configuration/datasets/potreePointCloud';
import type { ShapefileDatasetConfig } from '@/types/configuration/datasets/shapefile';
import type { TiledPointCloudDatasetConfig } from '@/types/configuration/datasets/tiledPointCloud';
import { Dataset, type DatasetBase } from '@/types/Dataset';
import Fetcher, { type FetchContext, type UrlOrFetchedData } from '@/utils/Fetcher';
import { BDTopoLoader } from './BDTopo';
import { CityJSONLoader } from './CityJSON';
import { CSVPointCloudLoader } from './CSVPointCloud';
import { GeoJSONLoader } from './GeoJSON';
import { GeopackageLoader } from './Geopackage';
import { GPXLoader } from './GPX';
import { IFCLoader } from './IFC';
import { KMLLoader } from './KML';
import { LASLoader } from './LAS';
import { PLYLoader } from './PLY';
import { PotreePointCloudLoader } from './PotreePointCloud';
import { ShapefileLoader } from './Shapefile';
import { TiledPointCloudLoader } from './TiledPointCloud';

/** Supported file types */
type FileType = 'gpkg' | 'las' | 'csv' | 'cityjson' | 'geojson' | 'ifc' | 'gpx' | 'kml';

/** Mapping between file extensions and file types */
const filetypesPerExtension: Record<string, FileType> = {
    csv: 'csv',
    dsv: 'csv',
    geojson: 'geojson',
    gpkg: 'gpkg',
    gpx: 'gpx',
    ifc: 'ifc',
    json: 'cityjson',
    kml: 'kml',
    las: 'las',
    laz: 'las',
    tsv: 'csv',
} as const;

/** Mapping between file types and the dataset types */
const datasetTypePerFileType: Record<FileType, DatasetTypeImportable> = {
    cityjson: 'cityjson',
    csv: 'pointcloud-csv',
    geojson: 'geojson',
    gpkg: 'gpkg',
    gpx: 'gpx',
    ifc: 'ifc',
    kml: 'kml',
    las: 'las',
} as const;

/** Information on a File */
interface FileInfo extends FetchContext {
    /** File type (if recognized) */
    type?: FileType;
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
    const type = context.fileext ? filetypesPerExtension[context.fileext] : undefined;
    const datasetType = type ? datasetTypePerFileType[type] : undefined;

    return {
        ...context,
        type,
        datasetType,
    };
}

/**
 * Loads a dataset and creates its Entity3D.
 *
 * @param instance - Giro3D instance
 * @param dataset - Dataset to load
 * @returns Entity3D
 * @throws `Error` if bad dataset parameters
 */
async function loadDataset(
    instance: Instance,
    dataset: Dataset & DatasetBase<DatasetAsMeshesConfig>,
): Promise<Entity3D> {
    let entity: Promise<Entity3D>;

    switch (dataset.type) {
        case 'bdtopo': {
            entity = new BDTopoLoader().load(instance, dataset as DatasetBase<BDTopoDatasetConfig>);
            break;
        }
        case 'cityjson': {
            entity = new CityJSONLoader().load(
                instance,
                dataset as DatasetBase<CityJSONDatasetConfig>,
            );
            break;
        }
        case 'geojson': {
            entity = new GeoJSONLoader().load(
                instance,
                dataset as DatasetBase<GeoJSONAsMeshDatasetConfig>,
            );
            break;
        }
        case 'gpkg': {
            entity = new GeopackageLoader().load(
                instance,
                dataset as DatasetBase<GeopackageDatasetConfig>,
            );
            break;
        }
        case 'gpx': {
            entity = new GPXLoader().load(instance, dataset as DatasetBase<GPXAsMeshDatasetConfig>);
            break;
        }
        case 'ifc': {
            entity = new IFCLoader().load(instance, dataset as DatasetBase<IFCDatasetConfig>);
            break;
        }
        case 'kml': {
            entity = new KMLLoader().load(instance, dataset as DatasetBase<KMLAsMeshDatasetConfig>);
            break;
        }
        case 'las': {
            entity = new LASLoader().load(instance, dataset as DatasetBase<LASDatasetConfig>);
            break;
        }
        case 'ply': {
            entity = new PLYLoader().load(instance, dataset as DatasetBase<PLYDatasetConfig>);
            break;
        }
        case 'pointcloud': {
            entity = new TiledPointCloudLoader().load(
                instance,
                dataset as DatasetBase<TiledPointCloudDatasetConfig>,
            );
            break;
        }
        case 'pointcloud-csv': {
            entity = new CSVPointCloudLoader().load(
                instance,
                dataset as DatasetBase<CSVPointCloudDatasetConfig>,
            );
            break;
        }
        case 'potree': {
            entity = new PotreePointCloudLoader().load(
                instance,
                dataset as DatasetBase<PotreePointCloudDatasetConfig>,
            );
            break;
        }
        case 'shp': {
            entity = new ShapefileLoader().load(
                instance,
                dataset as DatasetBase<ShapefileDatasetConfig>,
            );
            break;
        }
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = dataset.type;
            return _exhaustiveCheck;
        }
    }

    const e = await entity;
    if (!('dataset' in e.object3d.userData)) e.object3d.userData.dataset = {};
    e.object3d.userData.dataset.name = dataset.name;
    return e;
}

async function loadDatasetAsOverlay(
    instance: Instance,
    dataset: Dataset & DatasetBase<DatasetAsLayerConfig>,
): Promise<ColorLayer | MaskLayer> {
    const commonOptions = await LayerBuilder.getLayerOptions(dataset.config);
    switch (dataset.config.overlayType) {
        case 'color': {
            return new ColorLayer({
                ...commonOptions,
                elevationRange: dataset.config.elevationRange,
            });
        }
        case 'mask': {
            return new MaskLayer({
                ...commonOptions,
                maskMode: dataset.config.maskMode,
            });
        }
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = dataset.config.overlayType;
            return _exhaustiveCheck;
        }
    }
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
    const fileinfo = getFilename(file);

    if (fileinfo.filename == null || fileinfo.fileext == null) {
        throw new Error('Could not determine filename');
    }
    if (fileinfo.type == null || fileinfo.datasetType == null) {
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
                    type: 'cityjson',
                    url: file,
                },
            };
            break;
        case 'geojson':
            if (config.import_dataset_as_overlay) {
                datasetConfig = {
                    ...commonConfig,
                    type: 'geojson',
                    loadAsOverlay: true,
                    overlayType: 'color',
                    source: {
                        type: 'geojson',
                        url: file,
                        style: 'default',
                    },
                };
            } else {
                datasetConfig = {
                    ...commonConfig,
                    type: 'geojson',
                    source: {
                        type: 'geojson',
                        url: file,
                        fetchElevation: true,
                    },
                };
            }
            break;
        case 'gpkg':
            datasetConfig = {
                ...commonConfig,
                type: 'gpkg',
                source: {
                    type: 'gpkg',
                    url: file,
                    fetchElevation: true,
                },
            };
            break;
        case 'gpx':
            if (config.import_dataset_as_overlay) {
                datasetConfig = {
                    ...commonConfig,
                    type: 'gpx',
                    loadAsOverlay: true,
                    overlayType: 'color',
                    source: {
                        type: 'gpx',
                        url: file,
                        style: 'default',
                    },
                };
            } else {
                datasetConfig = {
                    ...commonConfig,
                    type: 'gpx',
                    source: {
                        type: 'gpx',
                        url: file,
                    },
                };
            }
            break;
        case 'ifc':
            datasetConfig = {
                ...commonConfig,
                type: 'ifc',
                source: {
                    type: 'ifc',
                    url: file,
                },
            };
            break;
        case 'las':
            datasetConfig = {
                ...commonConfig,
                type: 'las',
                source: {
                    type: 'las',
                    url: file,
                },
            };
            break;
        case 'kml':
            if (config.import_dataset_as_overlay) {
                datasetConfig = {
                    ...commonConfig,
                    type: 'kml',
                    loadAsOverlay: true,
                    overlayType: 'color',
                    source: {
                        type: 'kml',
                        url: file,
                        style: 'default',
                    },
                };
            } else {
                datasetConfig = {
                    ...commonConfig,
                    type: 'kml',
                    source: {
                        type: 'kml',
                        url: file,
                        fetchElevation: true,
                    },
                };
            }
            break;
        case 'pointcloud-csv':
            datasetConfig = {
                ...commonConfig,
                type: 'pointcloud-csv',
                source: {
                    type: 'pointcloud-csv',
                    url: file,
                },
            };
            break;
        case 'shp':
            datasetConfig = {
                ...commonConfig,
                type: 'shp',
                source: {
                    type: 'shp',
                    url: file,
                },
            };
            break;
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = fileinfo.datasetType;
            return _exhaustiveCheck;
        }
    }

    return new Dataset(datasetConfig);
}

export default {
    loadDataset,
    loadDatasetAsOverlay,
    importFile,
};
