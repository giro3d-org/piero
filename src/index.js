// eslint-disable-next-line no-unused-vars
import * as bootstrap from 'bootstrap';
import { Vector3, MeshLambertMaterial, sRGBEncoding } from 'three';
import Instance from '@giro3d/giro3d/core/Instance.js';
// import Inspector from '@giro3d/giro3d/gui/Inspector.js';
import Extent from '@giro3d/giro3d/core/geographic/Extent.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { createXYZ } from 'ol/tilegrid.js';
import { tile } from 'ol/loadingstrategy.js';
import FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection.js';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D.js';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource.js';
import PointsMaterial, { MODE } from '@giro3d/giro3d/renderer/PointsMaterial.js';

import Camera from './Camera.js';
import Lighting from './Lighting.js';
import StatusBar from './StatusBar.js';
import AttributePanel from './AttributePanel.js';
import Tour from './Tour.js';
import DrawingTools from './DrawingTools.js';
import LayerManager, { MAPPROVIDERS } from './LayerManager.js';
import Picking from './Picking.js';
import Projections from './Projections.js';
import Skybox from './Skybox.js';
import loader from './loaders/loader.js';
import Alerts from './Alerts.js';

/* eslint-disable import/first, import/order, import/no-unresolved, no-unused-vars */
// If you want to embed local data
// import ifc from 'url:./data/19_rue_Marc_Antoine_Petit.ifc';
/* eslint-enable */
const ifc = 'https://3d.oslandia.com/lyon/19_rue_Marc_Antoine_Petit.ifc';
const las = 'https://3d.oslandia.com/lyon/Semis_2021_0841_6520_LA93_IGN69-extracted.laz';
const cityjson = 'https://3d.oslandia.com/lyon/Semis_2021_0841_6520_LA93_IGN69.city.json';

const crsParam = new URL(document.URL).searchParams.get('crs');
let CRS = 'EPSG:2154';
if (crsParam !== null) {
    CRS = crsParam;
}

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

const z = 180;

const instance = new Instance(document.getElementById('viewerDiv'), {
    crs: CRS,
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
if (CRS === 'EPSG:2154') {
    layerManager.mapProvider = MAPPROVIDERS.IGN;
} else if (CRS === 'EPSG:3946') {
    layerManager.mapProvider = MAPPROVIDERS.GRANDLYON;
} else {
    layerManager.mapProvider = MAPPROVIDERS.MAPBOX;
}

const picking = new Picking(instance, layerManager);
camera.pickObjectsAt = e => picking.getPointAt(e);
const drawTools = new DrawingTools(instance, camera, layerManager, picking);
StatusBar.bind(instance, layerManager, camera);
const attributePanel = new AttributePanel(instance, layerManager);
attributePanel.bindToDrawingTools(drawTools);

layerManager.addEventListener('map-changed', () => {
    drawTools.setSnapping();
});

const dropZone = document.getElementById('main-container');

dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('border', 'border-success', 'border-5');
});

dropZone.addEventListener('dragleave', e => {
    e.preventDefault();
    dropZone.classList.remove('border', 'border-success', 'border-5');
});

dropZone.addEventListener('drop', async e => {
    e.preventDefault();
    dropZone.classList.remove('border', 'border-success', 'border-5');
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
    if (projection) {
        await Projections.loadProjCrsIfNeeded(projection);
        await loader.processFiles(instance, layerManager, camera, files, true, { projection, z });
    }
});

const annotationDropZone = document.getElementById('annotation-drop');

annotationDropZone.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    annotationDropZone.classList.add('border', 'border-success', 'border-2');
});

annotationDropZone.addEventListener('dragleave', e => {
    e.preventDefault();
    annotationDropZone.classList.remove('border', 'border-success', 'border-2');
});

annotationDropZone.addEventListener('drop', async e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    annotationDropZone.classList.remove('border', 'border-success', 'border-2');
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

    await loader.processFiles(instance, layerManager, camera, files, true, { projection: 'EPSG:4326', isAnnotation: true, z });
});

const extent = new Extent('EPSG:2154', 795689, 903507, 6493201, 6543980);
layerManager.createMap(extent);
setTimeout(() => {
    if (layerManager.elevationLayer.loading && layerManager.elevationLayer.progress < 0.1) {
        const link = document.createElement('a');
        link.setAttribute('href', './?crs=EPSG%3A3946');
        link.textContent = 'Map is taking longer to load; do you want to switch provider?';
        Alerts.showAlert(link);
    }
}, 5000);
camera.lookAt(
    new Vector3().fromArray(
        new Coordinates('EPSG:2154', 841623.9, 6517692.9, 435.4).as(instance.referenceCrs)._values,
    ),
    new Vector3().fromArray(
        new Coordinates('EPSG:2154', 841889.3, 6517785.3, 166.9).as(instance.referenceCrs)._values,
    ),
    false,
);

const lidarHdTiles = [
    'Semis_2021_0841_6518_LA93_IGN69',
    'Semis_2021_0841_6519_LA93_IGN69',
    // 'Semis_2021_0841_6520_LA93_IGN69',
    // 'Semis_2021_0841_6521_LA93_IGN69',
    // 'Semis_2021_0842_6520_LA93_IGN69',
    // 'Semis_2021_0842_6521_LA93_IGN69',
];

loader.processFiles(instance, layerManager, camera, [ifc], false, {
    // at: new Vector3(841900.7811846591, 6517809.405693541, 167),
}).then(() => {
    if (CRS === 'EPSG:2154') {
        const alert = Alerts.showAlert('Loading BDTOPO_V3:batiment...', 'info', true);

        const vectorSource = new VectorSource({
            format: new GeoJSON(),
            url: function url(e) {
                return (
                    `${'https://wxs.ign.fr/topographie/geoportail/wfs'
                    // 'https://download.data.grandlyon.com/wfs/rdata'
                    + '?SERVICE=WFS'
                    + '&VERSION=2.0.0'
                    + '&request=GetFeature'
                    + '&typename=BDTOPO_V3:batiment'
                    + '&outputFormat=application/json'
                    + '&SRSNAME=EPSG:2154'
                    + '&startIndex=0'
                    + '&bbox='}${e.join(',')},EPSG:2154`
                );
            },
            strategy: tile(createXYZ({ tileSize: 512 })),
        });

        const feat = new FeatureCollection('BDTOPO_V3', {
            source: vectorSource,
            extent: new Extent('EPSG:2154', -111629.52, 1275028.84, 5976033.79, 7230161.64),
            material: new MeshLambertMaterial(),
            extrude: feature => {
                const hauteur = -feature.getProperties().hauteur;
                if (Number.isNaN(hauteur)) {
                    return null;
                }
                return hauteur;
            },
            style: feature => {
                const properties = feature.getProperties();
                let color = '#FFFFFF';
                if (properties.usage_1 === 'Résidentiel') {
                    color = '#9d9484';
                } else if (properties.usage_1 === 'Commercial et services') {
                    color = '#b0ffa7';
                }
                return { color };
            },
            onMeshCreated: mesh => {
                // hide this particular mesh because we have a ifc for this
                if (mesh.userData.id === 'batiment.BATIMENT0000000240851971'
                    || mesh.userData.id === 'batiment.BATIMENT0000000240851972') {
                    mesh.visible = false;
                }
            },
            minLevel: 11,
            maxLevel: 11,
        });

        layerManager.addSet(feat, 'BDTOPO_V3:batiment');
        instance.add(feat).then(() => {
            alert.dismiss();
        });
    } else {
        Alerts.showAlert('Skipping BDTOPO_V3:batiment (unsupported with this CRS)', 'warning');
    }

    loader.processFiles(
        instance,
        layerManager,
        camera,
        lidarHdTiles.map(t => `https://3d.oslandia.com/lyon/${t}.city.json`),
        false,
        { visible: false, group: 'CityJSON' },
    );

    if (CRS === 'EPSG:2154') {
        lidarHdTiles.forEach(t => {
            const pointcloud = new Tiles3D(
                `pointcloud-${t}`,
                new Tiles3DSource(`https://3d.oslandia.com/lyon/3dtiles/${t}/tileset.json`),
                {
                    material: new PointsMaterial({
                        size: 2,
                        mode: MODE.ELEVATION,
                    }),
                },
            );
            pointcloud.visible = false;

            layerManager.addSet(pointcloud, t, 'LIDAR-HD');
        });
    } else {
        Alerts.showAlert('Skipping LIDAR-HD tiles (unsupported with this CRS)', 'warning', true);
    }
});
Tour.start(instance, layerManager, camera, drawTools);

instance.mainLoop.gfxEngine.renderer.outputEncoding = sRGBEncoding;
