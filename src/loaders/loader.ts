import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type Instance from '@giro3d/giro3d/core/Instance';

import { type DatasetImportedConfig } from '@/types/configuration/dataset';
import { Dataset, type DatasetTypeImportable } from '@/types/Dataset';
import Fetcher, { FetchContext, UrlOrFetchedData } from '@/utils/Fetcher';
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
    csv: 'pointcloud',
    geojson: 'geojson',
    gpkg: 'gpkg',
    gpx: 'gpx',
    ifc: 'ifc',
    kml: 'kml',
    las: 'pointcloud',
} as const;

/** Information on a File */
interface FileInfo extends FetchContext {
    /** File type (if recognized) */
    type?: FileType;
    /** Dataset type (if recognized) */
    datasetType?: DatasetTypeImportable;
}

/** Information on a File that we know is importable */
type ImportableFileInfo = Required<FileInfo>;

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
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            if (Array.isArray(dataset.url))
                throw new Error(`Cannot load ${dataset.name}: multiple urls`);
            entity = new CityJSONLoader().load(instance, { url: dataset.url });
            break;
        }
        case 'geojson': {
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            entity = new GeoJSONLoader().load(instance, {
                url: dataset.url,
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
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            entity = new GeopackageLoader().load(instance, {
                url: dataset.url,
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
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            entity = new GPXLoader().load(instance, {
                url: dataset.url,
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
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            if (Array.isArray(dataset.url))
                throw new Error(`Cannot load ${dataset.name}: multiple urls`);
            entity = new IFCLoader().load(instance, {
                url: dataset.url,
                name: dataset.name,
                at: dataset.get('coordinates'),
            });
            break;
        }
        case 'kml': {
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            entity = new KMLLoader().load(instance, {
                url: dataset.url,
                elevation: dataset.get('elevation'),
                fetchElevation:
                    dataset.get('fetchElevation') == null
                        ? dataset.get('elevation') == null
                        : dataset.get('fetchElevation'),
                fetchElevationFast: dataset.get('fetchElevationFast'),
            });
            break;
        }
        case 'ply': {
            const at = dataset.get('coordinates');
            if (!at) throw new Error(`Cannot load ${dataset.name}: no coordinates set`);
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            if (Array.isArray(dataset.url))
                throw new Error(`Cannot load ${dataset.name}: multiple urls`);
            entity = new PLYLoader().load(instance, {
                url: dataset.url,
                at: at.as(instance.referenceCrs),
            });
            break;
        }
        case 'pointcloud': {
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            if (Array.isArray(dataset.url))
                throw new Error(`Cannot load ${dataset.name}: multiple urls`);
            entity = new TiledPointCloudLoader().load(instance, {
                url: dataset.url,
                name: dataset.name,
            });
            break;
        }
        case 'shp': {
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            entity = new ShapefileLoader().load(instance, {
                url: dataset.url,
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
 * Loads a supported file and creates its Entity3D
 *
 * @param instance - Giro3D instance
 * @param file - File to load
 * @param fileinfo - File info
 * @returns Entity3D
 */
async function loadFile(
    instance: Instance,
    file: File,
    fileinfo: ImportableFileInfo,
): Promise<Entity3D> {
    switch (fileinfo.type) {
        case 'cityjson':
            return new CityJSONLoader().load(instance, { url: file });
        case 'csv':
            return new CSVPointCloudLoader().load(instance, { url: file });
        case 'geojson':
            return new GeoJSONLoader().load(instance, { url: file, fetchElevation: true });
        case 'gpkg':
            return new GeopackageLoader().load(instance, { url: file, fetchElevation: true });
        case 'gpx':
            return new GPXLoader().load(instance, { url: file, fetchElevation: true });
        case 'ifc':
            return new IFCLoader().load(instance, { url: file, name: fileinfo.filename });
        case 'kml':
            return new KMLLoader().load(instance, { url: file, fetchElevation: true });
        case 'las':
            return new LASLoader().load(instance, { url: file });
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = fileinfo.type;
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
async function importFile(instance: Instance, file: File): Promise<ImportFileResult> {
    const fileinfo = getFilename(file);

    if (fileinfo.filename == null || fileinfo.fileext == null) {
        throw new Error('Could not determine filename');
    }
    if (fileinfo.type == null || fileinfo.datasetType == null) {
        throw new Error(`File ${fileinfo.fileext} not supported`);
    }

    const entity = await loadFile(instance, file, fileinfo as ImportableFileInfo);
    if (!('dataset' in entity.object3d.userData)) entity.object3d.userData.dataset = {};
    entity.object3d.userData.dataset.name = fileinfo.filename;

    const datasetConfig: DatasetImportedConfig = {
        name: fileinfo.filename,
        type: fileinfo.datasetType,
        url: null,
        visible: true,
    };
    const dataset = new Dataset(datasetConfig);
    return { entity, dataset };
}

export default {
    loadDataset,
    importFile,
};
