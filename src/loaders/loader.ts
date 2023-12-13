import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Instance from '@giro3d/giro3d/core/Instance.js';
import Fetcher from '@giro3d/giro3d/utils/Fetcher';

import CityJSON, { type CityJSONOptions } from './CityJSON';
import GeoJSON from './GeoJSON.js';
import IFC, { type IFCOptions } from './IFC.js';
import PLY, { type PLYOptions } from './PLY.js';
import Loadersgl, { type LoaderglOptions } from './Loadersgl.js';
import { useNotificationStore } from '@/stores/notifications';
import Notification from '@/types/Notification';

/** Base options */
type BaseProcessOptions = {
    /** Indicates whether the file should be visible immediately */
    visible?: boolean;
};

/** Options */
export type ProcessOptions = (LoaderglOptions | CityJSONOptions | IFCOptions | PLYOptions) & BaseProcessOptions;

/** Supported file types */
export type FileType = 'gpkg' | 'las' | 'csv' | 'cityjson' | 'geojson' | 'ifc' | 'ply';

/** Mapping between file extensions and file types */
const filetypesPerExtension: Record<string, FileType> = {
    'gpkg': 'gpkg',
    'laz': 'las',
    'las': 'las',
    'csv': 'csv',
    'json': 'cityjson',
    'geojson': 'geojson',
    'ifc': 'ifc',
    'ply': 'ply',
} as const;

/** File types that require downloading the file (e.g. their loaders don't support URLs and need fetching) */
const filetypesRequireDownloadedFile: FileType[] = ['cityjson', 'geojson', 'ifc', 'ply'] as const;

/** Pre-processed file results */
interface PreprocessedFileResult {
    /** Filename */
    filename: string;
    /** File type */
    filetype: FileType;
    /** Downloaded file, if needed */
    file?: File | Response;
}

/** Processed file results */
export interface ProcessedFileResult {
    /** Filename */
    filename: string;
    /** File type */
    filetype: FileType;
    /** Giro3D entity */
    obj: Entity3D;
}

/**
 * Pre-processes a file
 * @param fileOrUrl File object to load, or URL to fetch and load
 * @returns Pre-processed result
 */
async function preprocessFile(fileOrUrl: File | string): Promise<PreprocessedFileResult> {
    let file: File | Response | undefined = undefined;
    let filename: string | undefined = undefined;

    if (fileOrUrl instanceof File) {
        filename = fileOrUrl.name;
        file = fileOrUrl;
    } else {
        filename = fileOrUrl.split('/').at(-1);
    }
    const fileext = filename?.split('.').at(-1);

    if (filename == null || fileext == null) {
        throw new Error('Could not determine filename');
    }

    if (!(fileext in filetypesPerExtension)) {
        throw new Error(`File ${fileext} not supported`);
    }

    const filetype = filetypesPerExtension[fileext];

    if (!(fileOrUrl instanceof File)
        && (filetypesRequireDownloadedFile.includes(filetype))
    ) {
        const notifications = useNotificationStore();
        notifications.push(new Notification(decodeURI(filename), 'Loading...'));

        file = await Fetcher.fetch(fileOrUrl);
    }

    return {
        filename,
        filetype,
        file
    };
}

/**
 * Processes a file and adds it into Giro3d scene.
 *
 * @param instance Giro3d instance
 * @param layerManager Layer manager
 * @param fileOrUrl File object to load, or URL to fetch and load
 * @param options Options
 * @returns Processed entity
 */
async function processFile(
    instance: Instance,
    // layerManager: LayerManager,
    fileOrUrl: File | string,
    options: ProcessOptions = {}
): Promise<ProcessedFileResult> {
    const { file, filename, filetype } = await preprocessFile(fileOrUrl);

    let obj: Entity3D | undefined;
    switch (filetype) {
        case 'gpkg': {
            obj = await Loadersgl.loadGeoPackage(instance, filename, fileOrUrl, options as LoaderglOptions);
            break;
        }
        case 'las': {
            obj = await Loadersgl.loadLas(instance, filename, fileOrUrl, options as LoaderglOptions);
            break;
        }
        case 'csv': {
            obj = await Loadersgl.loadCsv(instance, filename, fileOrUrl, options as LoaderglOptions);
            break;
        }
        case 'cityjson': {
            if (file == null) throw new Error('Could not load CityJSON file: file is null');
            const str = await file.text();
            obj = await CityJSON.loadString(instance, filename, str, options as CityJSONOptions);
            break;
        }
        case 'ifc': {
            if (file == null) throw new Error('Could not load IFC file: file is null');
            obj = await IFC.loadIfc(instance, filename, file, options as IFCOptions);
            break;
        }
        case 'geojson': {
            if (file == null) throw new Error('Could not load GeoJSON file: file is null');
            // const str = await file.text();
            // TODO layerManager
            // obj = await GeoJSON.loadString(instance, layerManager, filename, str, options);
            break;
        }
        case 'ply': {
            if (file == null) throw new Error('Could not load PLY file: file is null');
            obj = await PLY.loadPly(instance, filename, file, options as PLYOptions);
            break;
        }
        default:
            throw new Error(`File type ${filetype} is not supported`);
    }

    if (!obj) throw new Error('Could not create Giro3D object');

    const visible = options?.visible ?? true;
    if (!visible) {
        obj.visible = false;
    }

    return { filename, filetype, obj };
};

export default { processFile };
