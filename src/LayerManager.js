import {
    Box3, LineBasicMaterial, MeshBasicMaterial, PointsMaterial, EventDispatcher,
} from 'three';
import Giro3dMap from '@giro3d/giro3d/entities/Map.js';
import TileWMS from 'ol/source/TileWMS.js';
import XYZ from 'ol/source/XYZ.js';
import GML32 from 'ol/format/GML32.js';
import GPX from 'ol/format/GPX.js';
import KML from 'ol/format/KML.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {
    Fill, Stroke, Style, RegularShape,
} from 'ol/style.js';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource.js';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer.js';
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer.js';
import BilFormat from '@giro3d/giro3d/formats/BilFormat.js';
import Interpretation from '@giro3d/giro3d/core/layer/Interpretation.js';
import Extent from '@giro3d/giro3d/core/geographic/Extent.js';
import { GEOMETRY_TYPE } from '@giro3d/giro3d/interactions/DrawTool.js';
import Drawing from '@giro3d/giro3d/interactions/Drawing.js';
import Entity3D from '@giro3d/giro3d/entities/Entity3D.js';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import VectorSource from '@giro3d/giro3d/sources/VectorSource.js';

const drawnFaceMaterial = new MeshBasicMaterial({
    color: 0x433C73,
    opacity: 0.2,
});
const drawnSideMaterial = new MeshBasicMaterial({
    color: 0x433C73,
    opacity: 0.8,
});
const drawnLineMaterial = new LineBasicMaterial({
    color: 0x252140,
});
const drawnPointMaterial = new PointsMaterial({
    color: 0x433C73,
    size: 100,
});

function point2DFactory(index) {
    const pt = document.createElement('div');
    pt.style.position = 'absolute';
    pt.style.borderRadius = '50%';
    pt.style.width = '28px';
    pt.style.height = '28px';
    pt.style.backgroundColor = '#433C73';
    pt.style.color = '#ffffff';
    pt.style.border = '2px solid #070607';
    pt.style.fontSize = '14px';
    pt.style.textAlign = 'center';
    pt.style.pointerEvents = 'auto';
    pt.style.cursor = 'pointer';
    pt.innerText = `${index + 1}`;
    return pt;
}

function createLink(text, title, clickHandler) {
    const link = document.createElement('a');
    link.setAttribute('href', '#');
    link.setAttribute('title', title);
    link.textContent = text;
    link.className = 'layer-link link-underline-success link-underline-opacity-0 link-underline-opacity-75-hover';
    link.addEventListener('click', clickHandler);
    return link;
}

function createButtonLink(iconName, title, clickHandler, className = '', linkType = 'secondary') {
    const link = document.createElement('a');
    link.setAttribute('href', '#');
    link.setAttribute('title', title);
    link.className = `link-${linkType} link-opacity-50 link-opacity-100-hover ${className}`;
    link.addEventListener('click', clickHandler);

    const icon = document.createElement('i');
    icon.className = `bi ${iconName}`;
    link.appendChild(icon);

    return link;
}

const MAPPROVIDERS = {
    IGN: 'ign',
    MAPBOX: 'mapbox',
};

const mapboxkey = 'pk.eyJ1IjoidG11Z3VldCIsImEiOiJjam80c2ZjaDgwMm9wM3ZtYnk5ZHJ2MHdhIn0.fVxG4S6FeU9NZhkpkLLlsA';

class LayerManager extends EventDispatcher {
    constructor(instance, camera) {
        super();
        this.instance = instance;
        this.camera = camera;
        this.sets = new Map();
        this.annotations = [];
        this.baseMap = null;
        this.mapProvider = MAPPROVIDERS.IGN;
        this.imageryLayer = null;
        this.elevationLayer = null;
        this.overlayLayers = new Map();

        const baseMapElement = document.getElementById('basemap');
        baseMapElement.querySelector('.layer-link').addEventListener('click', () => this.camera.goToBox(this.baseMap.getBoundingBox()));
        baseMapElement.querySelector('.layer-expand-link').addEventListener('click', () => {
            const newExtent = this.baseMap.extent.withRelativeMargin(0.5);
            this.createMap(newExtent);
        });
        baseMapElement.querySelector('.layer-provider-link').addEventListener('click', () => {
            if (this.mapProvider === MAPPROVIDERS.IGN) {
                this.mapProvider = MAPPROVIDERS.MAPBOX;
            } else {
                this.mapProvider = MAPPROVIDERS.IGN;
            }
            this.baseMap.removeLayer(this.imageryLayer);
            this.baseMap.removeLayer(this.elevationLayer);
            this.imageryLayer = null;
            this.elevationLayer = null;
            this.baseMap.addLayer(this.getImageryLayer());
            this.baseMap.addLayer(this.getElevationLayer());
            this.instance.notifyChange(this.baseMap);
            this.dispatchEvent({ type: 'map-changed' });
        });
    }

    getImageryLayer() {
        if (this.imageryLayer) {
            return this.imageryLayer;
        }

        let source;
        switch (this.mapProvider) {
            case MAPPROVIDERS.IGN:
                source = new TileWMS({
                    url: 'https://wxs.ign.fr/ortho/geoportail/r/wms',
                    projection: this.instance.referenceCrs,
                    params: {
                        LAYERS: ['HR.ORTHOIMAGERY.ORTHOPHOTOS'],
                        FORMAT: 'image/jpeg',
                    },
                    version: '1.3.0',
                });
                break;
            case MAPPROVIDERS.MAPBOX:
                source = new XYZ({
                    url: `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.webp?access_token=${mapboxkey}`,
                    projection: this.instance.referenceCrs,
                    crossOrigin: 'anonymous',
                });
                break;
            default:
                throw new Error(`Provider ${this.mapProvider} not supported`);
        }

        const giro3dsource = new TiledImageSource({ source });
        this.imageryLayer = new ColorLayer(
            'imagery',
            {
                source: giro3dsource,
            },
        );
        return this.imageryLayer;
    }

    getElevationLayer() {
        if (this.elevationLayer) {
            return this.elevationLayer;
        }

        let source;
        let noDataValue;
        let format;
        let interpretation;
        switch (this.mapProvider) {
            case MAPPROVIDERS.IGN:
                source = new TileWMS({
                    url: 'https://wxs.ign.fr/altimetrie/geoportail/r/wms',
                    projection: this.instance.referenceCrs,
                    crossOrigin: 'anonymous',
                    params: {
                        LAYERS: ['ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES'],
                        FORMAT: 'image/x-bil;bits=32',
                    },
                    version: '1.3.0',
                });
                noDataValue = -1000;
                format = new BilFormat();
                break;
            case MAPPROVIDERS.MAPBOX:
                source = new XYZ({
                    url: `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=${mapboxkey}`,
                    projection: this.instance.referenceCrs,
                    crossOrigin: 'anonymous',
                });
                interpretation = Interpretation.MapboxTerrainRGB;
                break;
            default:
                throw new Error(`Provider ${this.mapProvider} not supported`);
        }

        const giro3dsource = new TiledImageSource({
            source,
            format,
            noDataValue,
        });
        this.elevationLayer = new ElevationLayer(
            'elevation',
            {
                source: giro3dsource,
                noDataValue,
                interpretation,
            },
        );
        return this.elevationLayer;
    }

    registerVectorLayer(layer) {
        this.overlayLayers.set(layer.id, layer);
        document.querySelector(`#overlay-${layer.id} .layer-toggle-visible-link`).addEventListener('click', () => {
            const btn = document.querySelector(`#overlay-${layer.id} a.layer-toggle-visible-link i`);
            if (layer.visible) {
                btn.classList.remove('bi-eye');
                btn.classList.add('bi-eye-slash');
            } else {
                btn.classList.add('bi-eye');
                btn.classList.remove('bi-eye-slash');
            }
            layer.visible = !layer.visible;
            this.instance.notifyChange(this.baseMap);
        });
    }

    getVectorLayers() {
        // if (this.instance.referenceCrs === 'EPSG:4326') {
        //     const riversLayer = new ColorLayer(
        //         'rivers',
        //         {
        //             extent: this.baseMap.extent,
        //             source: new VectorTileSource({
        //                 url: 'http://192.168.56.10/pg_tileserv/public.courseau/{z}/{x}/{y}.pbf',
        //                 projection: 'EPSG:4326',
        //                 crossOrigin: 'anonymous',
        //                 format: new MVT(),
        //                 style: new Style({
        //                     stroke: new Stroke({
        //                         color: 'blue',
        //                     }),
        //                 }),
        //             }),
        //         },
        //     );
        //     this.baseMap.addLayer(riversLayer);
        // }

        if (!this.overlayLayers.has('geojson')) {
            const geoJsonLayer = new ColorLayer(
                'geojson',
                {
                    source: new VectorSource({
                        data: 'https://3d.oslandia.com/lyon/evg_esp_veg.evgparcindiccanope_latest.geojson',
                        format: new GeoJSON(),
                        dataProjection: 'EPSG:4171',
                        style: feature => new Style({
                            fill: new Fill({
                                color: `rgba(0, 128, 0, ${feature.get('indiccanop')})`,
                            }),
                            stroke: new Stroke({
                                color: 'white',
                            }),
                        }),
                    }),
                },
            );
            this.registerVectorLayer(geoJsonLayer);
        }

        if (!this.overlayLayers.has('kml')) {
            const kmlLayer = new ColorLayer(
                'kml',
                {
                    source: new VectorSource({
                        data: 'https://3d.oslandia.com/lyon/tcl_sytral.tcllignemf_2_0_0.kml',
                        format: new KML(),
                        dataProjection: 'EPSG:4326',
                        style: new Style({
                            stroke: new Stroke({
                                color: '#FA8C22',
                                width: 2,
                            }),
                        }),
                    }),
                },
            );
            this.registerVectorLayer(kmlLayer);
        }

        if (!this.overlayLayers.has('gpx')) {
            const gpxLayer = new ColorLayer(
                'gpx',
                {
                    source: new VectorSource({
                        data: 'https://3d.oslandia.com/lyon/track.gpx',
                        dataProjection: 'EPSG:4326',
                        format: new GPX(),
                        style: new Style({
                            stroke: new Stroke({
                                color: '#FA8C22',
                                width: 2,
                            }),
                        }),
                    }),
                },
            );
            this.registerVectorLayer(gpxLayer);
        }

        if (!this.overlayLayers.has('gml')) {
            const gmlLayer = new ColorLayer(
                'gml',
                {
                    source: new VectorSource({
                        data: 'https://3d.oslandia.com/lyon/adr_voie_lieu.adrbornefontaine_latest.gml',
                        dataProjection: 'EPSG:4171',
                        format: new GML32(),
                        style: new Style({
                            image: new RegularShape({
                                radius: 3,
                                points: 4,
                                stroke: new Stroke({
                                    width: 1,
                                    color: [255, 255, 255, 1],
                                }),
                                fill: new Fill({
                                    color: [0, 0, 128, 1],
                                }),
                            }),
                        }),
                    }),
                },
            );
            this.registerVectorLayer(gmlLayer);
        }

        return this.overlayLayers;
    }

    createMap(extent) {
        if (this.baseMap) {
            // FIXME: flash of content, probably blocked by https://gitlab.com/giro3d/giro3d/-/issues/323
            this.baseMap.removeLayer(this.imageryLayer);
            this.baseMap.removeLayer(this.elevationLayer);
            Array.from(this.overlayLayers.values())
                .forEach(layer => this.baseMap.removeLayer(layer));
            this.instance.remove(this.baseMap);
        }

        this.baseMap = new Giro3dMap('map', {
            extent,
            hillshading: false,
            segments: 64,
            discardNoData: true,
            doubleSided: false,
        });
        this.instance.add(this.baseMap);

        // Create our imagery and elevation layers
        this.baseMap.addLayer(this.getImageryLayer());
        this.baseMap.addLayer(this.getElevationLayer());

        this.getVectorLayers().forEach((layer, id) => {
            layer.visible = document.querySelector(`#overlay-${id} .layer-toggle-visible-link i`).classList.contains('bi-eye');
            this.baseMap.addLayer(layer);
        });

        this.instance.notifyChange(this.baseMap);
        this.dispatchEvent({ type: 'map-changed' });
    }

    toggleSetVisibility(obj) {
        const btn = document.querySelector(`#layer-${obj.id} a.layer-toggle-visible-link i`);
        if (obj.visible) {
            btn.classList.remove('bi-eye');
            btn.classList.add('bi-eye-slash');
        } else {
            btn.classList.add('bi-eye');
            btn.classList.remove('bi-eye-slash');
        }
        obj.visible = !obj.visible;
        this.instance.notifyChange(obj);
    }

    addSet(obj, filename) {
        this.sets.set(obj.id, { obj, filename });

        const newItem = document.createElement('li');
        newItem.setAttribute('id', `layer-${obj.id}`);
        newItem.className = 'list-group-item';

        newItem.appendChild(createButtonLink('bi-eye', 'Hide this layer', () => this.toggleSetVisibility(obj), 'layer-toggle-visible-link', 'dark'));
        newItem.appendChild(createLink(filename, 'Zoom on this layer', () => this.camera.goToBox(obj.object3d)));
        newItem.appendChild(createButtonLink('bi-trash', 'Delete this layer', () => this.deleteSet(obj), 'layer-delete-link'));

        document.getElementById('layer-list').appendChild(newItem);
        document.getElementById('layers').classList.remove('d-none');

        const snapToOption = document.createElement('option');
        snapToOption.setAttribute('value', obj.id);
        snapToOption.textContent = filename;
        document.getElementById('snapToObject').appendChild(snapToOption);

        const bbox = obj.getBoundingBox();
        const dataExtent = Extent.fromBox3(this.instance.referenceCrs, bbox)
            .withRelativeMargin(4, 4);
        if (this.baseMap !== null) {
            const newExtent = this.baseMap.extent.clone();
            if (!dataExtent.isInside(newExtent)) {
                newExtent.expandByPoint(
                    new Coordinates(this.instance.referenceCrs, bbox.min.x, bbox.min.y),
                );
                newExtent.expandByPoint(
                    new Coordinates(this.instance.referenceCrs, bbox.max.x, bbox.max.y),
                );
                this.createMap(newExtent);
            }
        } else {
            this.createMap(dataExtent);
        }
    }

    addAnnotationSet(obj) {
        const filename = `annotation-${obj.id}`;
        this.sets.set(obj.id, { obj, filename });

        const newItem = document.createElement('li');
        newItem.setAttribute('id', `layer-${obj.id}`);
        newItem.className = 'list-group-item';

        newItem.appendChild(createLink(filename, 'Zoom on this layer', () => this.camera.goToBox(obj.object3d)));
        newItem.appendChild(createButtonLink('bi-trash', 'Delete this layer', () => this.deleteSet(obj), 'layer-delete-link'));
        newItem.appendChild(createButtonLink('bi-file-earmark-arrow-down', 'Download this annotation', () => this.downloadAnnotation(obj), 'layer-download-link'));

        document.getElementById('annotation-list').appendChild(newItem);
        document.getElementById('layers').classList.remove('d-none');
    }

    deleteSet(obj) {
        document.getElementById(`layer-${obj.id}`).remove();
        this.sets.delete(obj.id);
        this.instance.remove(obj.object3d);

        const select = document.getElementById('snapToObject');
        Array.from(select.children).forEach(v => {
            if (v.getAttribute('value') === obj.id) {
                select.removeChild(v);
            }
        });

        if (this.sets.size === 0) {
            this.deleteMap();
        }
    }

    addAnnotation(geojson, add = true) {
        const o = new Drawing(this.instance, {
            faceMaterial: drawnFaceMaterial,
            sideMaterial: drawnSideMaterial,
            lineMaterial: drawnLineMaterial,
            pointMaterial: drawnPointMaterial,
            minExtrudeDepth: 1,
            maxExtrudeDepth: 5,
            use3Dpoints: false,
            point2DFactory,
        }, geojson);

        const annotation = new Entity3D(o.uuid, o);
        if (add) {
            this.instance.add(annotation);
            this.addAnnotationSet(annotation);
        }
        this.dispatchEvent({ type: 'annotation', annotation });
        return annotation;
    }

    downloadAnnotation(obj) {
        const annotation = obj.object3d;
        const nbPoints = annotation.coordinates.length / 3;
        const coords = [];
        const coordinates = new Coordinates(this.instance.referenceCrs);
        const coordinatesWgs84 = new Coordinates('EPSG:4326');
        for (let i = 0; i < nbPoints; i += 1) {
            coordinates.set(this.instance.referenceCrs,
                annotation.coordinates[i * 3 + 0],
                annotation.coordinates[i * 3 + 1],
                annotation.coordinates[i * 3 + 2]);
            coordinates.as('EPSG:4326', coordinatesWgs84);
            coords.push([
                coordinatesWgs84._values[0],
                coordinatesWgs84._values[1],
                coordinatesWgs84._values[2],
            ]);
        }
        let outCoordinates;
        switch (annotation.geometryType) {
            case GEOMETRY_TYPE.POINT:
                outCoordinates = coords[0];
                break;
            case GEOMETRY_TYPE.LINE:
            case GEOMETRY_TYPE.MULTIPOINT:
                outCoordinates = coords;
                break;
            case GEOMETRY_TYPE.POLYGON:
            default:
                {
                    // Polygon is always closed
                    const outerRing = coords;
                    outCoordinates = [outerRing];
                }
                break;
        }
        const geojson = {
            type: 'Feature',
            geometry: {
                type: annotation.geometryType,
                coordinates: outCoordinates,
            },
        };
        const blob = new Blob([JSON.stringify(geojson, null, 2)], {
            type: 'application/json',
        });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'annotation.geojson';
        link.innerHTML = 'Click here to download the file';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
    }

    getObjects3d() {
        return Array.from(this.sets.values()).map(v => v.obj.object3d);
    }

    getBoundingBox() {
        const bbox = new Box3();
        const bbox2 = new Box3();
        this.getObjects3d().forEach(obj => {
            bbox2.setFromObject(obj);
            bbox.union(bbox2);
        });
        return bbox;
    }

    getObjectAt(e, radius = 1) {
        const picked = this.instance.pickObjectsAt(e, {
            radius,
            where: this.getObjects3d(),
        })
            .filter(p => p.layer === null)
            .sort((a, b) => (a.distance - b.distance)).at(0);

        let layer = null;
        let rootobj = null;
        let drawing = null;

        if (picked) {
            rootobj = picked.object;
            while (layer === null && rootobj !== null) {
                if (rootobj instanceof Drawing) drawing = rootobj;

                if (this.has(rootobj.uuid)) {
                    layer = this.get(rootobj.uuid);
                } else {
                    rootobj = rootobj.parent;
                }
            }

            return {
                ...picked,
                layer,
                rootobj,
                drawing,
            };
        }
        return null;
    }

    hasData() {
        return this.sets.size > 0;
    }

    has(id) {
        if (id === 'basemap') return this.baseMap !== null;
        return this.sets.has(id);
    }

    get(id) {
        if (id === 'basemap') return this.baseMap;
        return this.sets.get(id);
    }

    setBasemap(map) {
        this.baseMap = map;
    }
}

export default LayerManager;
