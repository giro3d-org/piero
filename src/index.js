// eslint-disable-next-line no-unused-vars
import * as bootstrap from 'bootstrap';
import { Box3, Vector3, MeshLambertMaterial, sRGBEncoding } from 'three';
import Instance from '@giro3d/giro3d/core/Instance.js';
// import Inspector from '@giro3d/giro3d/gui/Inspector.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Extent from '@giro3d/giro3d/core/geographic/Extent.js';
import { GEOMETRY_TYPE } from '@giro3d/giro3d/interactions/Drawing.js';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D.js';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { createXYZ } from 'ol/tilegrid.js';
import { tile } from 'ol/loadingstrategy.js';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection.js';

import IFC from './loaders/IFC.js';
import Loadersgl from './loaders/Loadersgl.js';
import CityJSON from './loaders/CityJSON.js';
import Camera from './Camera.js';
import Lighting from './Lighting.js';
import StatusBar from './StatusBar.js';
import AttributePanel from './AttributePanel.js';
import Tour from './Tour.js';
import DrawingTools from './DrawingTools.js';
import LayerManager from './LayerManager.js';
import Picking from './Picking.js';
import Projections from './Projections.js';
import Alerts from './Alerts.js';
import Skybox from './Skybox.js';

/* eslint-disable import/first, import/order, import/no-unresolved, no-unused-vars */
// If you want to embed local data
import ifc from 'url:./data/19_rue_Marc_Antoine_Petit.ifc';
/* eslint-enable */
const las = 'https://3d.oslandia.com/lyon/Semis_2021_0841_6520_LA93_IGN69-extracted.laz';
const cityjson = 'https://3d.oslandia.com/lyon/Semis_2021_0841_6520_LA93_IGN69.city.json';

Instance.registerCRS('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs');
Instance.registerCRS('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs');
Instance.registerCRS('EPSG:2154', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
Instance.registerCRS('EPSG:4171', '+proj=longlat +ellps=GRS80 +no_defs +type=crs');
Instance.registerCRS('EPSG:3946', '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
// Montreal CityJSON
// fetch("https://raw.githubusercontent.com/OSGeo/proj-datumgrid/master/north-america/NA83SCRS.GSB").then(f => f.arrayBuffer()).then(buffer => {
//     proj4.nadgrid('NA83SCRS.GSB', buffer);
// eslint-disable-next-line max-len
//     Instance.registerCRS('EPSG:32198', '+proj=lcc +lat_0=44 +lon_0=-68.5 +lat_1=60 +lat_2=46 +x_0=0 +y_0=0 +ellps=GRS80 +nadgrids=NA83SCRS.GSB +units=m +no_defs +type=crs');
// });
// eslint-disable-next-line max-len
// Instance.registerCRS("EPSG:2950","+proj=tmerc +lat_0=0 +lon_0=-73.5 +k=0.9999 +x_0=304800 +y_0=0 +ellps=GRS80 +towgs84=-0.991,1.9072,0.5129,-1.25033e-07,-4.6785e-08,-5.6529e-08,0 +units=m +no_defs +type=crs");

let z;

const instance = new Instance(document.getElementById('viewerDiv'), {
    crs: 'EPSG:2154',
    renderer: {
        clearColor: 0xcccccc,
    },
});
// Inspector.attach(document.getElementById('panelDiv'), instance);

Lighting.addLight(instance);
Skybox.addSkybox(instance);

const camera = new Camera(instance);
camera.bindKeys();

const layerManager = new LayerManager(instance, camera);

const picking = new Picking(instance, layerManager);
camera.pickObjectsAt = e => picking.getPointAt(e);
const drawTools = new DrawingTools(instance, camera, layerManager, picking);
StatusBar.bind(instance, layerManager, camera);
const attributePanel = new AttributePanel(instance, layerManager);
attributePanel.bindToDrawingTools(drawTools);

layerManager.addEventListener('map-changed', () => {
    drawTools.setSnapping();
});

const processFile = async (file, options = {}) => {
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

    if (!(file instanceof File) && (filetype === 'cityjson' || filetype === 'ifc' || filetype === 'geojson')) {
        file = await fetch(file);
    }

    if (filetype === null) {
        throw new Error('File not supported');
    }

    let obj = null;
    switch (filetype) {
        case 'gpkg': {
            obj = await Loadersgl.loadGeoPackage(instance, filename, file, { z, ...options });
            break;
        }
        case 'las': {
            obj = await Loadersgl.loadLas(instance, filename, file, options);
            const bbox = new Box3();
            const tmpVec3 = new Vector3();
            obj.getBoundingBox(bbox);
            bbox.getCenter(tmpVec3);
            z = tmpVec3.z;
            break;
        }
        case 'csv': {
            obj = await Loadersgl.loadCsv(instance, filename, file, options);
            const bbox = new Box3();
            const tmpVec3 = new Vector3();
            obj.getBoundingBox(bbox);
            bbox.getCenter(tmpVec3);
            z = tmpVec3.z;
            break;
        }
        case 'cityjson': {
            const str = await file.text();
            obj = await CityJSON.loadString(instance, filename, str, options);
            break;
        }
        case 'ifc': {
            let at;
            if (options.at) {
                at = options.at.clone();
            } else {
                at = new Vector3();
                camera.controls.getTarget(at);
            }
            obj = await IFC.loadIfc(instance, filename, file, at, options);
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
    if (obj !== null) {
        instance.add(obj.object3d);
    }

    return { filename, obj };
};

const processFiles = async (files, zoomTo = true, options = {}) => {
    const promises = [];
    StatusBar.addTask(files.length);

    const hasData = layerManager.hasData();

    files.forEach(file => {
        const p = processFile(file, options);
        promises.push(p);
        p.finally(() => {
            StatusBar.doneTask();
        });
    });

    const settled = await Promise.allSettled(promises);

    const objs = [];
    const bbox = new Box3();
    const bbox2 = new Box3();
    settled.filter(p => p.status === 'fulfilled').forEach(p => {
        const { obj, filename } = p.value;
        if (Array.isArray(obj)) {
            obj.forEach(o => {
                o.getBoundingBox(bbox2);
                bbox.union(bbox2);
                if (options?.isAnnotation) {
                    layerManager.addAnnotationSet(o);
                } else {
                    layerManager.addSet(o, filename);
                }
                objs.push(o);
            });
        } else {
            obj.getBoundingBox(bbox2);
            bbox.union(bbox2);
            if (options?.isAnnotation) {
                layerManager.addAnnotationSet(obj);
            } else {
                layerManager.addSet(obj, filename);
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
            await camera.goToBox(bbox, hasData);
        } else {
            Alerts.showAlert('No data to show', 'warning');
        }
    }

    return objs;
};

document.body.addEventListener('dragover', e => {
    e.preventDefault();
});

document.body.addEventListener('drop', async e => {
    e.preventDefault();
    const files = [];

    if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...e.dataTransfer.items].forEach(item => {
            // If dropped items aren't files, reject them
            if (item.kind === 'file') {
                const file = item.getAsFile();
                files.push(file);
            }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...e.dataTransfer.files].forEach(file => {
            files.push(file);
        });
    }

    const projection = window.prompt('Projection?', instance.referenceCrs);
    await Projections.loadProjCrsIfNeeded(projection);
    await processFiles(files, true, { projection });
});

document.getElementById('annotation-drop').addEventListener('dragover', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
});

document.getElementById('annotation-drop').addEventListener('drop', async e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    const files = [];

    if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...e.dataTransfer.items].forEach(item => {
            // If dropped items aren't files, reject them
            if (item.kind === 'file') {
                const file = item.getAsFile();
                files.push(file);
            }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...e.dataTransfer.files].forEach(file => {
            files.push(file);
        });
    }

    await processFiles(files, true, { projection: 'EPSG:4326', isAnnotation: true });
});

const extent = new Extent('EPSG:2154', 836545, 846996, 6513414, 6526230);
layerManager.createMap(extent);
camera.lookAt(
    new Vector3(841601.5, 6516696.7, 3387.7),
    new Vector3(841777.5, 6518175.8, 39.2),
    false,
);

processFiles([las], false, { projection: 'EPSG:2154' })
    .then(() => Promise.allSettled([
        processFiles([cityjson], false, { projection: 'EPSG:2154' }),
        processFiles([ifc], false, {
            // at: new Vector3(841900.7811846591, 6517809.405693541, 167),
        }),
    ])).then(() => {
        const vectorSource = new VectorSource({
            format: new GeoJSON(),
            url: function url(e) {
                return (
                    'https://wxs.ign.fr/topographie/geoportail/wfs'
                    // 'https://download.data.grandlyon.com/wfs/rdata'
                    + '?SERVICE=WFS'
                    + '&VERSION=2.0.0'
                    + '&request=GetFeature'
                    + '&typename=BDTOPO_V3:batiment'
                    + '&outputFormat=application/json'
                    + '&SRSNAME=EPSG:2154'
                    + '&startIndex=0'
                    + '&bbox=' + e.join(',') + ',EPSG:2154'
                );
            },
            strategy: tile(createXYZ({ tileSize: 512 })),
        });

        const feat = new FeatureCollection('test', {
            source: vectorSource,
            extent: new Extent('EPSG:2154', -111629.52, 1275028.84, 5976033.79, 7230161.64),
            material: new MeshLambertMaterial(),
            extrude: (feat) => {
                const hauteur = -feat.getProperties().hauteur;
                if (Number.isNaN(hauteur)) {
                    return null;
                } else {
                    return hauteur;
                }
            },
            color: (feat) => {
                if (feat.usage_1 === 'Résidentiel') {
                    return '#9d9484';
                } else if (feat.usage_1 === 'Commercial et services') {
                    return '#b0ffa7';
                }
                return '#FFFFFF';

            },
            onMeshCreated: (mesh) => {
                // hide this particular mesh because we have a ifc for this
                if (mesh.userData.id === 'batiment.BATIMENT0000000240851971'
                    || mesh.userData.id === 'batiment.BATIMENT0000000240851972') {
                    mesh.visible = false;
                }
            },
            minLevel: 11,
            maxLevel: 11,
        });

        instance.add(feat);
    });
Tour.start(instance, layerManager, camera, drawTools);

instance.mainLoop.gfxEngine.renderer.outputEncoding = sRGBEncoding;
