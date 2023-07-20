// eslint-disable-next-line no-unused-vars
import * as bootstrap from 'bootstrap';
import autoComplete from '@tarekraafat/autocomplete.js';
import { MeshLambertMaterial, sRGBEncoding } from 'three';
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
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial.js';

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
import FloodingPlane from './FloodingPlane.js';
import loader from './loaders/loader.js';
import Alerts from './Alerts.js';
import PointsMaterial2 from './PointsMaterial2.js';
import Minimap from './Minimap.js';

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

const forEachFile = (e, callback) => {
    if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...e.dataTransfer.items].forEach(item => {
            // If dropped items aren't files, reject them
            if (item.kind === 'file') {
                const file = item.getAsFile();
                callback(file);
            }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...e.dataTransfer.files].forEach(file => {
            callback(file);
        });
    }
};

const z = 300;

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

const autoCompleteJS = new autoComplete({
    selector: '#autoComplete',
    placeHolder: 'Search for a place...',
    threshold: 3,
    debounce: 300, // 300ms debounce
    data: {
        src: async query => {
            const source = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${query}`);
            const data = await source.json();

            const lng = [];
            const lat = [];

            data.features.forEach(feature => {
                lng.push(feature.geometry.coordinates[0]);
                lat.push(feature.geometry.coordinates[1]);
            });

            const requestAltitude = await fetch(`https://wxs.ign.fr/calcul/alti/rest/elevation.json?lon=${lng.join('|')}&lat=${lat.join('|')}&zonly=true`);
            const altitude = await requestAltitude.json();
            altitude.elevations.forEach((value, i) => {
                data.features[i].properties.z = value;
            });

            return data.features.map(f => f.properties);
        },
        keys: ['label'],
    },
    resultsList: {
        element: (list, data) => {
            if (!data.results.length) {
                const message = document.createElement('div');
                message.setAttribute('class', 'no_result');
                message.innerHTML = `<span>No results found for "${data.query}"</span>`;
                list.prepend(message);
            }
        },
        noResults: true,
    },
    resultItem: {
        highlight: true,
    },
    // Trust what we get from the query
    searchEngine: (query, record) => record,
});

document.getElementById('autoComplete').addEventListener('selection', event => {
    const selection = event.detail.selection.value;
    const coords = new Coordinates('EPSG:2154', selection.x, selection.y);
    const extent = Extent.fromCenterAndSize('EPSG:2154', { x: coords._values[0], y: coords._values[1] }, 100, 100);
    const newExtent = extent.as(instance.referenceCrs);
    if (!newExtent.equals(layerManager.baseMap.extent) && !newExtent.isInside(layerManager.baseMap.extent)) {
        const newExtent = layerManager.baseMap.extent.clone();
        const locationExtent = Extent.fromCenterAndSize('EPSG:2154', { x: coords._values[0], y: coords._values[1] }, 10000, 10000);
        newExtent.union(locationExtent);
        layerManager.createMap(newExtent);
    }
    const bbox3 = newExtent.toBox3(selection.z, selection.z + 200);
    camera.lookTopDownAt(bbox3, false);
});

const dropZone = document.getElementById('datasets-drop-zone');

dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.remove('border-3');
    dropZone.classList.add('border-success', 'border-5', 'bg-light');
});

dropZone.addEventListener('dragleave', e => {
    e.preventDefault();
    dropZone.classList.add('border-3');
    dropZone.classList.remove('border-success', 'border-5', 'bg-light');
});

dropZone.addEventListener('drop', async e => {
    e.preventDefault();
    dropZone.classList.add('border-3');
    dropZone.classList.remove('border-success', 'border-5', 'bg-light');
    const files = [];
    forEachFile(e, file => files.push(file));

    const projection = window.prompt('Projection?', instance.referenceCrs);
    if (projection) {
        await Projections.loadProjCrsIfNeeded(projection);
        await loader.processFiles(instance, layerManager, camera, files, true, { projection, z });
    }
});

const annotationDropZone = document.getElementById('annotation-drop-zone');

annotationDropZone.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    annotationDropZone.classList.remove('border-3');
    annotationDropZone.classList.add('border-success', 'border-5', 'bg-light');
});

annotationDropZone.addEventListener('dragleave', e => {
    e.preventDefault();
    annotationDropZone.classList.add('border-3');
    annotationDropZone.classList.remove('border-success', 'border-5', 'bg-light');
});

annotationDropZone.addEventListener('drop', async e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    annotationDropZone.classList.add('border-3');
    annotationDropZone.classList.remove('border-success', 'border-5', 'bg-light');
    const files = [];
    forEachFile(e, file => files.push(file));

    await loader.processFiles(instance, layerManager, camera, files, true, { projection: 'EPSG:4326', isAnnotation: true, z });
});

const extent = new Extent('EPSG:2154', -378305.81, 6005281.2, 1320649.57, 7235612.72);
layerManager.createMap(extent);
setTimeout(() => {
    if (layerManager.elevationLayer.loading && layerManager.elevationLayer.progress == 0) {
        const link = document.createElement('a');
        link.setAttribute('href', './?crs=EPSG%3A3946');
        link.className = 'link-body-emphasis';
        link.textContent = 'Map is taking longer to load; do you want to switch provider?';
        Alerts.showAlert(link);
    }
}, 10000);

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
        const alert = Alerts.showAlert('Loading BDTOPO_V3:batiment...', null, true);

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
                    material: new PointsMaterial2({
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

const floodingPlane = new FloodingPlane(instance, layerManager);
floodingPlane.add();

instance.mainLoop.gfxEngine.renderer.outputEncoding = sRGBEncoding;

const minimap = new Minimap(instance, layerManager, camera);

const addBookmark = (name, url) => {
    const newBookmark = document.createElement('li');
    newBookmark.setAttribute('data-camera', url);
    newBookmark.className = 'layers-list-item';

    const itemContainer = document.createElement('div');
    itemContainer.className = 'layers-list-name';

    const link = document.createElement('a');
    link.setAttribute('href', '#');
    link.setAttribute('title', 'Go to this bookmark');
    link.className = 'layer-link';
    link.addEventListener('click', e => {
        e.preventDefault();
        StatusBar.processUrl(newBookmark.getAttribute('data-camera'));
    });
    link.textContent = name;
    itemContainer.appendChild(link);

    const shareBtnLink = document.createElement('a');
    shareBtnLink.setAttribute('href', '#');
    shareBtnLink.setAttribute('title', 'Share this bookmark');
    shareBtnLink.className = 'link-right layer-share-link';
    shareBtnLink.addEventListener('click', () => {
        document.getElementById('share-url').value = newBookmark.getAttribute('data-camera');
        const myModal = new bootstrap.Modal(document.getElementById('share-modal'));
        myModal.show();
    });
    shareBtnLink.innerHTML = '<i class="bi bi-share"></i>';

    const deleteBtnLink = document.createElement('a');
    deleteBtnLink.setAttribute('href', '#');
    deleteBtnLink.setAttribute('title', 'Delete this bookmark');
    deleteBtnLink.className = 'link-right layer-delete-link';
    deleteBtnLink.addEventListener('click', () => newBookmark.remove());
    deleteBtnLink.innerHTML = '<i class="bi bi-trash"></i>';

    newBookmark.appendChild(itemContainer);
    newBookmark.appendChild(shareBtnLink);
    newBookmark.appendChild(deleteBtnLink);
    document.getElementById('bookmarks-list').appendChild(newBookmark);
};

document.getElementById('bookmark-add').addEventListener('click', () => {
    const name = window.prompt('Name of the bookmark?');
    addBookmark(name, document.URL);
});

const shareBtn = document.getElementById('share-button');
const shareBtnIcon = shareBtn.querySelector('i');
shareBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(document.getElementById('share-url').value);
        shareBtnIcon.classList.add('bi-clipboard-check-fill');
        shareBtnIcon.classList.remove('bi-clipboard');
        setTimeout(() => {
            shareBtnIcon.classList.remove('bi-clipboard-check-fill');
            shareBtnIcon.classList.add('bi-clipboard');
        }, 5000);
    } catch {
        console.warn('clipboard write failed');
    }
});

addBookmark('Entrée du 19', 'https://giro3d.gitlab.io/giro3d-sample-application/?tour=none&view=%7B%22camera%22%3A%5B841907.9582841829%2C6517787.65521322%2C169.2769810864122%5D%2C%22target%22%3A%5B841905.9107490426%2C6517796.488850237%2C168.92811463287262%5D%2C%22focalOffset%22%3A%5B0.1351798506853955%2C-1.1107277925158936%2C-0.0692478782882926%5D%7D#');
addBookmark('Dans le 19', 'https://giro3d.gitlab.io/giro3d-sample-application/?tour=none&view=%7B%22camera%22%3A%5B841907.6003244669%2C6517804.267584243%2C169.49371378935163%5D%2C%22target%22%3A%5B841904.9652515985%2C6517800.24380922%2C168.73592572126938%5D%2C%22focalOffset%22%3A%5B-0.30363049587455837%2C0.22468656748455534%2C-0.014673078923675753%5D%7D#');
addBookmark('Vue sur le garage du 19', 'https://giro3d.gitlab.io/giro3d-sample-application/?tour=none&view=%7B%22camera%22%3A%5B841860.4692259617%2C6517792.984830552%2C191.21411266131565%5D%2C%22target%22%3A%5B841901.2899232162%2C6517810.408867405%2C169.85813324644857%5D%2C%22focalOffset%22%3A%5B0.2949500591331041%2C-3.6008486326489155%2C-0.13268550054589667%5D%7D#');
addBookmark('Arrière du 19', 'https://giro3d.gitlab.io/giro3d-sample-application/?tour=none&view=%7B%22camera%22%3A%5B841966.6506722774%2C6517864.268691576%2C190.95422252742796%5D%2C%22target%22%3A%5B841913.4352599139%2C6517812.324168317%2C169.15296200564165%5D%2C%22focalOffset%22%3A%5B2.0426879919662166%2C-8.267105061883605%2C-0.4693093363601122%5D%7D#');
addBookmark('Fondations du 19', 'https://giro3d.gitlab.io/giro3d-sample-application/?tour=none&view=%7B%22camera%22%3A%5B841871.8770916554%2C6517798.538974017%2C155.65424729209084%5D%2C%22target%22%3A%5B841901.7521345608%2C6517804.963136713%2C165.52349038600133%5D%2C%22focalOffset%22%3A%5B1.7327890501628165%2C-0.1845099456196122%2C-0.04731606047529624%5D%7D#');
addBookmark('Le 19 et ses environs', 'https://giro3d.gitlab.io/giro3d-sample-application/?tour=none&view=%7B%22camera%22%3A%5B841744.9576999792%2C6517718.901091238%2C283.6097874584819%5D%2C%22target%22%3A%5B841901.6182452319%2C6517800.275075872%2C179.14278666426824%5D%2C%22focalOffset%22%3A%5B6.738773819877206%2C-19.858962589364367%2C-1.0748023014785133%5D%7D#');
addBookmark('Le 19 et le paysage', 'https://giro3d.gitlab.io/giro3d-sample-application/?tour=none&view=%7B%22camera%22%3A%5B841969.449049433%2C6517752.161582657%2C203.38205913044018%5D%2C%22target%22%3A%5B841866.8800354004%2C6517820.759963989%2C185.57999730110168%5D%2C%22focalOffset%22%3A%5B0.403518238854284%2C-7.241380524293113%2C-0.2111343661354823%5D%7D#');
addBookmark('Entrée du tunnel de Fourvière', 'https://giro3d.gitlab.io/giro3d-sample-application/?tour=none&view=%7B%22camera%22%3A%5B842319.2354694218%2C6518423.6514408905%2C982.2764168906542%5D%2C%22target%22%3A%5B841467.6411646309%2C6518689.56648481%2C204.65999610900877%5D%2C%22focalOffset%22%3A%5B-133.00559793804737%2C3.608051492495065%2C-7.503250702104424%5D%7D#');
addBookmark('Vue Gerland / presqu\'île ZAE', 'https://giro3d.gitlab.io/giro3d-sample-application/?tour=none&view=%7B%22camera%22%3A%5B843055.3614169422%2C6514043.626172147%2C1742.6153714081702%5D%2C%22target%22%3A%5B842330.1707302815%2C6516692.815461843%2C165.21757514013598%5D%2C%22focalOffset%22%3A%5B-290.32328427637674%2C64.65089483112388%2C-13.99631154495546%5D%7D#');
addBookmark('Montée des eaux', 'https://giro3d.gitlab.io/giro3d-sample-application/?tour=none&view=%7B%22camera%22%3A%5B842174.999664611%2C6514276.1477145245%2C6860.909402103927%5D%2C%22target%22%3A%5B842286.984712678%2C6518559.138938386%2C133.93685948173655%5D%2C%22focalOffset%22%3A%5B-77.98304235607155%2C165.71519272364185%2C-2.5822836835623093%5D%7D#');

document.getElementById('share').addEventListener('click', () => {
    document.getElementById('share-url').value = document.URL;
    const myModal = new bootstrap.Modal(document.getElementById('share-modal'));
    myModal.show();
});

document.getElementById('bookmarks-export').addEventListener('click', () => {
    const bookmarks = [];
    document.querySelectorAll('#bookmarks-list .layers-list-item').forEach(item => {
        bookmarks.push({ title: item.querySelector('.layers-list-name a').textContent, url: item.getAttribute('data-camera') });
    });

    const blob = new Blob([JSON.stringify(bookmarks, null, 2)], {
        type: 'application/json',
    });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'bookmarks.json';
    link.innerHTML = 'Click here to download the file';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
});

const importBookmarks = async file => {
    const str = await file.text();
    const bookmarks = JSON.parse(str);

    const existingBookmarks = [];
    document.querySelectorAll('#bookmarks-list .layers-list-item').forEach(item => {
        existingBookmarks.push(item.querySelector('.layers-list-name a').textContent);
    });

    let nbImported = 0;
    let nbSkipped = 0;
    bookmarks.forEach(bookmark => {
        if (existingBookmarks.indexOf(bookmark.title) === -1) {
            addBookmark(bookmark.title, bookmark.url);
            nbImported++;
        } else {
            nbSkipped++;
        }
    });
    Alerts.showAlert(`${nbImported} bookmarks imported (${nbSkipped} skipped)`, 'success', true);
};

const bookmarksDropZone = document.getElementById('bookmarks-drop-zone');

bookmarksDropZone.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    bookmarksDropZone.classList.remove('border-3');
    bookmarksDropZone.classList.add('border-success', 'border-5', 'bg-light');
});

bookmarksDropZone.addEventListener('dragleave', e => {
    e.preventDefault();
    bookmarksDropZone.classList.add('border-3');
    bookmarksDropZone.classList.remove('border-success', 'border-5', 'bg-light');
});

bookmarksDropZone.addEventListener('drop', async e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    bookmarksDropZone.classList.add('border-3');
    bookmarksDropZone.classList.remove('border-success', 'border-5', 'bg-light');

    forEachFile(e, file => importBookmarks(file));
});
