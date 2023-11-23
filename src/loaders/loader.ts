import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Instance from '@giro3d/giro3d/core/Instance.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

import CityJSON from './CityJSON';
import GeoJSON from './GeoJSON.js';
import IFC from './IFC.js';
import Loadersgl from './Loadersgl.js';
import { useNotificationStore } from '@/stores/notifications';
import Notification from '@/types/Notification';

/**
 * Options
 */
interface ProcessOptions {
    projection?: string;
    at?: Coordinates;
    z?: number;
    visible?: boolean;
    isAnnotation?: boolean;
    group?: string | undefined;
    loader?: import('@loaders.gl/core').LoaderOptions;
}

type FileType = 'gpkg' | 'las' | 'csv' | 'cityjson' | 'geojson' | 'ifc';

/**
 * Processed file results
 */
interface ProcessedFileResult {
    filename: string;
    filetype: FileType;
    obj: Entity3D;
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
    /** @type {File|Response} */
    let file: File | Response = null;
    let filename: string = null;
    let filetype: FileType = null;

    if (fileOrUrl instanceof File) {
        filename = fileOrUrl.name;
        file = fileOrUrl;
    } else {
        filename = fileOrUrl.split('/').at(-1);
    }

    if (filename.endsWith('.gpkg')) {
        filetype = 'gpkg';
    } else if (filename.endsWith('.laz') || filename.endsWith('.las')) {
        filetype = 'las';
    } else if (filename.endsWith('.csv')) {
        filetype = 'csv';
    } else if (filename.endsWith('.json')) {
        filetype = 'cityjson';
    } else if (filename.endsWith('.geojson')) {
        filetype = 'geojson';
    } else if (filename.endsWith('.ifc')) {
        filetype = 'ifc';
    }

    if (filetype === null) {
        throw new Error('File not supported');
    }

    const notifications = useNotificationStore();
    notifications.push(new Notification(decodeURI(filename), 'Loading...'));

    if (!(fileOrUrl instanceof File)
        && (filetype === 'cityjson' || filetype === 'ifc' || filetype === 'geojson')
    ) {
        file = await fetch(fileOrUrl);
    }

    let obj: Entity3D = null;
    switch (filetype) {
        case 'gpkg': {
            obj = await Loadersgl.loadGeoPackage(instance, filename, fileOrUrl, options);
            break;
        }
        case 'las': {
            obj = await Loadersgl.loadLas(instance, filename, fileOrUrl, options);
            break;
        }
        case 'csv': {
            obj = await Loadersgl.loadCsv(instance, filename, fileOrUrl, options);
            break;
        }
        case 'cityjson': {
            const str = await file.text();
            obj = await CityJSON.loadString(instance, filename, str, options);
            break;
        }
        case 'ifc': {
            obj = await IFC.loadIfc(instance, filename, file, options);
            break;
        }
        case 'geojson': {
            const str = await file.text();
            // TODO layerManager
            obj = await GeoJSON.loadString(instance, layerManager, filename, str, options);
            break;
        }
        default:
            throw new Error('File not supported');
    }

    const visible = options?.visible ?? true;
    if (!visible) {
        obj.visible = false;
    }

    return { filename, filetype, obj };
};

export default { processFile };
