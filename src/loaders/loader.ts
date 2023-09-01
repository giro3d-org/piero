import { Box3 } from 'three';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';

import CityJSON from './CityJSON';
import GeoJSON from './GeoJSON.js';
import IFC from './IFC.js';
import Loadersgl from './Loadersgl.js';
import NotificationController from '../components/controllers/NotificationController.js';
import Instance from '@giro3d/giro3d/core/Instance.js';
import Camera from '../components/controllers/CameraController.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';

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

/**
 * Processed file results
 */
interface ProcessedFileResult {
    filename: string;
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
    let filename = null;
    let filetype = null;

    if (fileOrUrl instanceof File) {
        filename = fileOrUrl.name;
        file = fileOrUrl;
    } else {
        const urlobject = new URL(fileOrUrl);
        filename = urlobject.pathname.split('/').at(-1);
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

    const alert = NotificationController.showNotification(filename, `Loading ${filename}...`);

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
            obj = await GeoJSON.loadString(instance, layerManager, filename, str, options);
            break;
        }
        default:
            throw new Error('File not supported');
    }
    // alert.dismiss();

    const visible = options?.visible ?? true;
    if (!visible) {
        obj.visible = false;
    }
    // if (obj !== null && visible) {
    //     instance.add(obj);
    // }

    return { filename, obj };
};

/**
 * Processes multiple files.
 *
 * @param instance Giro3d instance
 * @param layerManager Layer manager
 * @param camera Camera object for zooming into the loaded files
 * @param files File to load, as objects or URLs
 * @param zoomTo Zooms into the loaded file once done
 * @param options Options
 * @returns Processed entities
 */
async function processFiles(
    instance: Instance,
    layerManager: LayerManager,
    camera: Camera,
    files: Array<File | string>,
    zoomTo: boolean = true,
    options: ProcessOptions = {}
): Promise<Array<Entity3D>> {
    const promises = [];
    // StatusBar.addTask(files.length);

    const hasData = layerManager.hasData();

    files.forEach(file => {
        const p = processFile(instance, layerManager, file, options);
        promises.push(p);
        p.finally(() => {
            // StatusBar.doneTask();
        });
    });

    const settled = await Promise.allSettled(promises);
    // eslint-disable-next-line jsdoc/no-undefined-types
    /** @type {Array<PromiseFulfilledResult<ProcessedFileResult>>} */
    // @ts-ignore
    const fullfilled: Array<PromiseFulfilledResult<ProcessedFileResult>> = settled.filter(p => p.status === 'fulfilled');
    // eslint-disable-next-line jsdoc/no-undefined-types
    /** @type {Array<PromiseRejectedResult>} */
    // @ts-ignore
    const rejected: Array<PromiseRejectedResult> = settled.filter(p => p.status === 'rejected');

    const objs = [];
    const bbox = new Box3();
    let bbox2;

    fullfilled.forEach(p => {
        const { obj, filename } = p.value;
        if (Array.isArray(obj)) {
            obj.forEach(o => {
                bbox2 = o.getBoundingBox();
                bbox.union(bbox2);
                if (options?.isAnnotation) {
                    layerManager.addAnnotationSet(o);
                } else {
                    layerManager.addSet(o, filename, options?.group);
                }
                objs.push(o);
            });
        } else {
            bbox2 = obj.getBoundingBox();
            bbox.union(bbox2);
            if (options?.isAnnotation) {
                layerManager.addAnnotationSet(obj);
            } else {
                layerManager.addSet(obj, filename, options?.group);
            }
            objs.push(obj);
        }
    });

    rejected.forEach(p => {
        console.warn('Could not load file', p.reason);
        NotificationController.showNotification('Loader', `Could not load file: ${p.reason}`, 'error');
    });

    if (zoomTo) {
        if (!bbox.isEmpty()) {
            await camera.lookTopDownAt(bbox, hasData);
        } else {
            NotificationController.showNotification('Loader', 'No data to show', 'warning');
        }
    }

    return objs;
};

export default { processFile, processFiles };
