import { Object3D } from 'three';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import Instance from '@giro3d/giro3d/core/Instance';

import { DatasetImportedConfig } from '@/types/Configuration';
import { Dataset, DatasetTypeImportable } from '@/types/Dataset';
import { UrlOrGlDataType } from '@/utils/Fetcher';
import CityJSON from './CityJSON';
import GeoJSON from './GeoJSON';
import IFC from './IFC';
import PLY from './PLY';
import BDTopo from './BDTopo';
import TiledPointCloud from './TiledPointCloud';
import Shapefile from './Shapefile';
import Geopackage from './Geopackage';
import CSVPointCloud from './CSVPointCloud';
import LAS from './LAS';

/** Supported file types */
type FileType = 'gpkg' | 'las' | 'csv' | 'cityjson' | 'geojson' | 'ifc';

/** Mapping between file extensions and file types */
const filetypesPerExtension: Record<string, FileType> = {
    gpkg: 'gpkg',
    laz: 'las',
    las: 'las',
    csv: 'csv',
    json: 'cityjson',
    geojson: 'geojson',
    ifc: 'ifc',
} as const;

/** Mapping between file types and the dataset types */
const datasetTypePerFileType: Record<FileType, DatasetTypeImportable> = {
    gpkg: 'gpkg',
    las: 'pointcloud',
    csv: 'pointcloud',
    cityjson: 'cityjson',
    geojson: 'geojson',
    ifc: 'ifc',
} as const;

/** Information on a File */
interface FileInfo {
    /** Filename */
    name?: string;
    /** File extension */
    ext?: string;
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
 * @param fileOrUrl File or URL
 * @returns File name and extension
 */
function getFilename(fileOrUrl: UrlOrGlDataType): FileInfo {
    let filename: string | undefined = undefined;

    if (fileOrUrl instanceof File) {
        filename = fileOrUrl.name;
    } else if (fileOrUrl instanceof Response) {
        filename = fileOrUrl.url.split('/').at(-1);
    } else if (typeof fileOrUrl === 'string' || fileOrUrl instanceof String) {
        filename = fileOrUrl.split('/').at(-1);
    }

    const fileext = filename?.split('.').at(-1);
    const filetype = fileext ? filetypesPerExtension[fileext] : undefined;
    const datasetType = filetype ? datasetTypePerFileType[filetype] : undefined;

    return { name: filename, ext: fileext, type: filetype, datasetType };
}

/**
 * Loads a dataset and creates its Entity3D.
 *
 * @param instance Giro3D instance
 * @param dataset Dataset to load
 * @returns Entity3D
 * @throws `Error` if bad dataset parameters
 */
async function loadDataset(instance: Instance, dataset: Dataset): Promise<Entity3D> {
    let entity: Promise<Entity3D>;

    switch (dataset.type) {
        case 'bdtopo': {
            entity = BDTopo.load(instance, { name: dataset.name });
            break;
        }
        case 'cityjson': {
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            if (Array.isArray(dataset.url))
                throw new Error(`Cannot load ${dataset.name}: multiple urls`);
            entity = CityJSON.load(instance, dataset.url);
            break;
        }
        case 'ifc': {
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            if (Array.isArray(dataset.url))
                throw new Error(`Cannot load ${dataset.name}: multiple urls`);
            const at = dataset.get('coordinates');
            entity = IFC.load(instance, dataset.url, {
                name: dataset.name,
                at: at?.as(instance.referenceCrs),
            });
            break;
        }
        case 'ply': {
            const at = dataset.get('coordinates');
            if (!at) throw new Error(`Cannot load ${dataset.name}: no coordinates set`);
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            if (Array.isArray(dataset.url))
                throw new Error(`Cannot load ${dataset.name}: multiple urls`);
            entity = PLY.load(instance, dataset.url, {
                at: at.as(instance.referenceCrs),
            });
            break;
        }
        case 'shp': {
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            entity = Shapefile.loadAll(instance, dataset.url, {
                elevation: dataset.get('elevation'),
            });
            break;
        }
        case 'geojson': {
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            entity = GeoJSON.loadAll(instance, dataset.url, {
                elevation: dataset.get('elevation'),
            });
            break;
        }
        case 'gpkg': {
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            entity = Geopackage.loadAll(instance, dataset.url, {
                elevation: dataset.get('elevation'),
            });
            break;
        }
        case 'pointcloud': {
            if (dataset.url == null) throw new Error(`Cannot load ${dataset.name}: empty url`);
            if (Array.isArray(dataset.url))
                throw new Error(`Cannot load ${dataset.name}: multiple urls`);
            entity = TiledPointCloud.load(instance, dataset.url, { name: dataset.name });
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
 * @param instance Giro3D instance
 * @param file File to load
 * @param fileinfo File info
 * @returns Entity3D
 */
async function loadFile(
    instance: Instance,
    file: File,
    fileinfo: ImportableFileInfo,
): Promise<Entity3D> {
    switch (fileinfo.type) {
        case 'cityjson':
            return CityJSON.load(instance, file);
        case 'csv':
            return CSVPointCloud.load(instance, file);
        case 'geojson':
            return GeoJSON.load(instance, file);
        case 'gpkg':
            return Geopackage.load(instance, file);
        case 'ifc':
            return IFC.load(instance, file, { name: fileinfo.name });
        case 'las':
            return LAS.load(instance, file);
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
 * @param instance Giro3D instance
 * @param file File to load
 * @returns Created objects
 * @throws `Error` if file cannot be imported (unsupported, etc.)
 */
async function importFile(instance: Instance, file: File): Promise<ImportFileResult> {
    const fileinfo = getFilename(file);

    if (fileinfo.name == null || fileinfo.ext == null) {
        throw new Error('Could not determine filename');
    }
    if (fileinfo.type == null || fileinfo.datasetType == null) {
        throw new Error(`File ${fileinfo.ext} not supported`);
    }

    const entity = await loadFile(instance, file, fileinfo as ImportableFileInfo);
    if (!('dataset' in entity.object3d.userData)) entity.object3d.userData.dataset = {};
    entity.object3d.userData.dataset.name = fileinfo.name;

    const datasetConfig: DatasetImportedConfig = {
        name: fileinfo.name,
        type: fileinfo.datasetType,
        url: null,
        visible: true,
    };
    const dataset = new Dataset(datasetConfig);
    return { entity, dataset };
}

function fillOrigin(object: Object3D, url: UrlOrGlDataType) {
    const fileinfo = getFilename(url);
    if (fileinfo.name) {
        if (!('dataset' in object.userData)) object.userData.dataset = {};
        object.userData.dataset.filename = fileinfo.name;
    }
}

export default {
    loadDataset,
    importFile,
    getFilename,
    fillOrigin,
};
