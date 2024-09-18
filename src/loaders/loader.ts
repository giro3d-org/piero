import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type Instance from '@giro3d/giro3d/core/Instance';

import type {
    DatasetConfigImportable,
    DatasetTypeImportable,
} from '@/types/configuration/datasets';
import { CityJSONDatasetConfig } from '@/types/configuration/datasets/CityJSON';
import { CSVPointCloudDatasetConfig } from '@/types/configuration/datasets/CSVPointCloud';
import { GeoJSONDatasetConfig } from '@/types/configuration/datasets/GeoJSON';
import { GeopackageDatasetConfig } from '@/types/configuration/datasets/Geopackage';
import { GPXDatasetConfig } from '@/types/configuration/datasets/GPX';
import { IFCDatasetConfig } from '@/types/configuration/datasets/IFC';
import { KMLDatasetConfig } from '@/types/configuration/datasets/KML';
import { LASDatasetConfig } from '@/types/configuration/datasets/LAS';
import { PLYDatasetConfig } from '@/types/configuration/datasets/PLY';
import { PotreePointcCloudDatasetConfig } from '@/types/configuration/datasets/PotreePointCloud';
import { ShapefileDatasetConfig } from '@/types/configuration/datasets/Shapefile';
import { TiledPointCloudDatasetConfig } from '@/types/configuration/datasets/TiledPointCloud';
import { Dataset, type DatasetConfigParameters } from '@/types/Dataset';
import { getCoordinates } from '@/utils/Configuration';
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
async function loadDataset(instance: Instance, dataset: Dataset): Promise<Entity3D> {
    let entity: Promise<Entity3D>;

    switch (dataset.type) {
        case 'bdtopo': {
            entity = new BDTopoLoader().load(instance, { name: dataset.name });
            break;
        }
        case 'cityjson': {
            const opts = dataset.parameters as DatasetConfigParameters<CityJSONDatasetConfig>;
            entity = new CityJSONLoader().load(instance, { url: opts.url });
            break;
        }
        case 'geojson': {
            const opts = dataset.parameters as DatasetConfigParameters<GeoJSONDatasetConfig>;
            entity = new GeoJSONLoader().load(instance, {
                url: opts.url,
                elevation: dataset.get('elevation'),
                fetchElevation:
                    dataset.get('fetchElevation') == null
                        ? dataset.get('elevation') == null
                        : dataset.get('fetchElevation'),
                fetchElevationFast: dataset.get('fetchElevationFast'),
            });
            break;
        }
        case 'gpkg': {
            const opts = dataset.parameters as DatasetConfigParameters<GeopackageDatasetConfig>;
            entity = new GeopackageLoader().load(instance, {
                url: opts.url,
                elevation: dataset.get('elevation'),
                fetchElevation:
                    dataset.get('fetchElevation') == null
                        ? dataset.get('elevation') == null
                        : dataset.get('fetchElevation'),
                fetchElevationFast: dataset.get('fetchElevationFast'),
            });
            break;
        }
        case 'gpx': {
            const opts = dataset.parameters as DatasetConfigParameters<GPXDatasetConfig>;
            entity = new GPXLoader().load(instance, {
                url: opts.url,
                elevation: dataset.get('elevation'),
                fetchElevation:
                    dataset.get('fetchElevation') == null
                        ? dataset.get('elevation') == null
                        : dataset.get('fetchElevation'),
                fetchElevationFast: dataset.get('fetchElevationFast'),
            });
            break;
        }
        case 'ifc': {
            const opts = dataset.parameters as DatasetConfigParameters<IFCDatasetConfig>;
            entity = new IFCLoader().load(instance, {
                url: opts.url,
                name: dataset.name,
                at: getCoordinates(dataset.get('position')),
            });
            break;
        }
        case 'kml': {
            const opts = dataset.parameters as DatasetConfigParameters<KMLDatasetConfig>;
            entity = new KMLLoader().load(instance, {
                url: opts.url,
                elevation: dataset.get('elevation'),
                fetchElevation:
                    dataset.get('fetchElevation') == null
                        ? dataset.get('elevation') == null
                        : dataset.get('fetchElevation'),
                fetchElevationFast: dataset.get('fetchElevationFast'),
            });
            break;
        }
        case 'las': {
            const opts = dataset.parameters as DatasetConfigParameters<LASDatasetConfig>;
            entity = new LASLoader().load(instance, {
                url: opts.url,
            });
            break;
        }
        case 'ply': {
            const opts = dataset.parameters as DatasetConfigParameters<PLYDatasetConfig>;
            const at = getCoordinates(dataset.get('position'));
            if (!at) throw new Error(`Cannot load ${dataset.name}: no coordinates set`);
            entity = new PLYLoader().load(instance, {
                url: opts.url,
                at,
            });
            break;
        }
        case 'pointcloud': {
            const opts =
                dataset.parameters as DatasetConfigParameters<TiledPointCloudDatasetConfig>;
            entity = new TiledPointCloudLoader().load(instance, {
                url: opts.url,
                name: dataset.name,
            });
            break;
        }
        case 'pointcloud-csv': {
            const opts = dataset.parameters as DatasetConfigParameters<CSVPointCloudDatasetConfig>;
            entity = new CSVPointCloudLoader().load(instance, {
                url: opts.url,
            });
            break;
        }
        case 'potree': {
            const opts =
                dataset.parameters as DatasetConfigParameters<PotreePointcCloudDatasetConfig>;
            entity = new PotreePointCloudLoader().load(instance, {
                urlBase: opts.url,
                filename: opts.filename,
            });
            break;
        }
        case 'shp': {
            const opts = dataset.parameters as DatasetConfigParameters<ShapefileDatasetConfig>;
            entity = new ShapefileLoader().load(instance, {
                url: opts.url,
                elevation: dataset.get('elevation'),
                fetchElevation:
                    dataset.get('fetchElevation') == null
                        ? dataset.get('elevation') == null
                        : dataset.get('fetchElevation'),
                fetchElevationFast: dataset.get('fetchElevationFast'),
            });
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

/**
 * Loads a file and creates its Entity3D and Dataset.
 *
 * @param instance - Giro3D instance
 * @param file - File to load
 * @returns Created objects
 * @throws `Error` if file cannot be imported (unsupported, etc.)
 */
async function importFile(instance: Instance, file: File): Promise<ImportFileResult> {
    const fileinfo = getFilename(file);

    if (fileinfo.filename == null || fileinfo.fileext == null) {
        throw new Error('Could not determine filename');
    }
    if (fileinfo.type == null || fileinfo.datasetType == null) {
        throw new Error(`File ${fileinfo.fileext} not supported`);
    }

    const datasetConfig = {
        type: fileinfo.datasetType,
        name: fileinfo.filename,
        url: file,
        visible: true,
    } as DatasetConfigImportable;

    const dataset = new Dataset(datasetConfig);
    const entity = await loadDataset(instance, dataset);

    return { entity, dataset };
}

export default {
    loadDataset,
    importFile,
};
