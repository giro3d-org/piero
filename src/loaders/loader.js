import { Box3 } from 'three';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import { GEOMETRY_TYPE } from '@giro3d/giro3d/interactions/Drawing.js';

import Alerts from '../Alerts.js';
import StatusBar from '../StatusBar.js';
import CityJSON from './CityJSON.js';
import IFC from './IFC.js';
import Loadersgl from './Loadersgl.js';

const processFile = async (instance, layerManager, file, options = {}) => {
    let filename = null;
    let filetype = null;

    if (file instanceof File) {
        filename = file.name;
    } else {
        const urlobject = new URL(file);
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

    const alert = Alerts.showAlert(`Loading ${filename}...`, 'info');

    if (!(file instanceof File) && (filetype === 'cityjson' || filetype === 'ifc' || filetype === 'geojson')) {
        file = await fetch(file);
    }

    let obj = null;
    switch (filetype) {
        case 'gpkg': {
            obj = await Loadersgl.loadGeoPackage(instance, filename, file, options);
            break;
        }
        case 'las': {
            obj = await Loadersgl.loadLas(instance, filename, file, options);
            break;
        }
        case 'csv': {
            obj = await Loadersgl.loadCsv(instance, filename, file, options);
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
            const json = JSON.parse(await file.text());
            const coordinatesWgs84 = new Coordinates('EPSG:4326');
            const coordinates = new Coordinates(instance.referenceCrs);
            switch (json.geometry.type) {
                case GEOMETRY_TYPE.POINT: {
                    coordinatesWgs84.set(
                        'EPSG:4326',
                        json.geometry.coordinates[0],
                        json.geometry.coordinates[1],
                        json.geometry.coordinates[2],
                    );
                    coordinatesWgs84.as(instance.referenceCrs, coordinates);
                    json.geometry.coordinates[0] = coordinates._values[0];
                    json.geometry.coordinates[1] = coordinates._values[1];
                    json.geometry.coordinates[2] = coordinates._values[2];
                    break;
                }
                case GEOMETRY_TYPE.LINE:
                case GEOMETRY_TYPE.MULTIPOINT: {
                    for (let i = 0; i < json.geometry.coordinates.length; i += 1) {
                        coordinatesWgs84.set(
                            'EPSG:4326',
                            json.geometry.coordinates[i][0],
                            json.geometry.coordinates[i][1],
                            json.geometry.coordinates[i][2],
                        );
                        coordinatesWgs84.as(instance.referenceCrs, coordinates);
                        json.geometry.coordinates[i][0] = coordinates._values[0];
                        json.geometry.coordinates[i][1] = coordinates._values[1];
                        json.geometry.coordinates[i][2] = coordinates._values[2];
                    }
                    break;
                }
                case GEOMETRY_TYPE.POLYGON: {
                    for (let i = 0; i < json.geometry.coordinates[0].length; i += 1) {
                        coordinatesWgs84.set(
                            'EPSG:4326',
                            json.geometry.coordinates[0][i][0],
                            json.geometry.coordinates[0][i][1],
                            json.geometry.coordinates[0][i][2],
                        );
                        coordinatesWgs84.as(instance.referenceCrs, coordinates);
                        json.geometry.coordinates[0][i][0] = coordinates._values[0];
                        json.geometry.coordinates[0][i][1] = coordinates._values[1];
                        json.geometry.coordinates[0][i][2] = coordinates._values[2];
                    }
                    break;
                }
                default:
                    throw new Error('Geometry not supported');
            }
            obj = layerManager.addAnnotation(json.geometry, false);
            break;
        }
        default:
            throw new Error('File not supported');
    }
    alert.dismiss();

    const visible = options?.visible ?? true;
    if (!visible) {
        obj.visible = false;
    }
    if (obj !== null && visible) {
        instance.add(obj.object3d);
    }

    return { filename, obj };
};

const processFiles = async (instance, layerManager, camera, files, zoomTo = true, options = {}) => {
    const promises = [];
    StatusBar.addTask(files.length);

    const hasData = layerManager.hasData();

    files.forEach(file => {
        const p = processFile(instance, layerManager, file, options);
        promises.push(p);
        p.finally(() => {
            StatusBar.doneTask();
        });
    });

    const settled = await Promise.allSettled(promises);

    const objs = [];
    const bbox = new Box3();
    let bbox2;
    settled.filter(p => p.status === 'fulfilled').forEach(p => {
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

    settled.filter(p => p.status === 'rejected').forEach(p => {
        console.warn('Could not load file', p.reason);
        Alerts.showAlert(`Could not load file: ${p.reason}`);
    });

    if (zoomTo) {
        if (!bbox.isEmpty()) {
            await camera.lookTopDownAt(bbox, hasData);
        } else {
            Alerts.showAlert('No data to show', 'warning');
        }
    }

    return objs;
};

export default { processFile, processFiles };
