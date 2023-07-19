import {
    Box3, LineBasicMaterial, MeshBasicMaterial, PointsMaterial, EventDispatcher, Object3D, Vector3,
} from 'three';
import { MAIN_LOOP_EVENTS } from '@giro3d/giro3d/core/MainLoop.js';
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
import TileIndex from '@giro3d/giro3d/core/TileIndex.js';

/**
 * @typedef {import('@giro3d/giro3d/core/Instance').default} Instance
 * @typedef {import('three').Face} Face
 * @typedef {import('./Camera').default} Camera
 */

/**
 * Wrapper for our datasets.
 *
 * @typedef {object} Dataset
 * @property {Entity3D} obj Object wrapped
 * @property {string} filename Original filename used to upload/download data.
 */

/**
 * Picked object
 *
 * @typedef {object} PickResult
 * @property {Dataset} layer Layer picked
 * @property {Object3D} rootobj Parent Object3D picked (directly created by dataset)
 * @property {Object3D} object Object3D picked
 * @property {Vector3} point Point picked
 * @property {?Drawing} drawing Drawing object, if any (may be null)
 * @property {number} distance Distance from camera
 * @property {?number} distanceToRay Distance to ray when raycasting, if any (may be null or
 * undefined)
 * @property {?number} index Index from raycasting, if any (may be null or undefined)
 * @property {?Face} face Face from raycasting, if any (may be null or undefined)
 * @property {?number} faceIndex Face index from raycasting, if any (may be null or undefined)
 */

// Patch Giro3D, remove me when https://gitlab.com/giro3d/giro3d/-/issues/168 is closed
Giro3dMap.prototype.getVectorFeaturesAtCoordinate = function getVectorFeaturesAtCoordinate(
    coordinate,
    hitTolerance = 0,
    tileHint = undefined,
    target = [],
) {
    if (hitTolerance === 0) {
        for (const layer of this._attachedLayers) {
            if (layer.type !== 'MaskLayer' && layer.source && layer.source instanceof VectorSource && layer.visible) {
                const coordinateLayer = coordinate.as(layer.extent.crs());
                const coord = [coordinateLayer.x(), coordinateLayer.y()];
                for (const feature of layer.source.getFeaturesAtCoordinate(coord)) {
                    target.push({ layer, feature });
                }
            }
        }
    } else {
        let tile = tileHint;
        if (!tile) {
            tile = this.tileIndex.tiles.get(TileIndex.getKey(0, 0, 0)).deref();
            for (const t of this.tileIndex.tiles) {
                const n = t[1].deref();
                if (n && n.material && n.material.visible && n.extent.isPointInside(coordinate)) {
                    tile = n;
                    break;
                }
            }
        }
        const tileLayer = tile.extent.as(coordinate.crs);

        const tileExtent = tileLayer.dimensions();
        const imageSize = this.imageSize;
        const xRes = tileExtent.x / imageSize.x;
        const yRes = tileExtent.y / imageSize.y;
        const hitToleranceSqr = hitTolerance ** 2;

        const e = new Extent(
            coordinate.crs,
            coordinate.x() - xRes * hitTolerance,
            coordinate.x() + xRes * hitTolerance,
            coordinate.y() - yRes * hitTolerance,
            coordinate.y() + yRes * hitTolerance,
        );

        const features = this.getVectorFeaturesInExtent(e);
        for (const feat of features) {
            const layerProjection = feat.layer.getExtent()?.crs() ?? this._instance.referenceCrs;
            const coordinateLayer = coordinate.as(layerProjection);
            const coord = [coordinateLayer.x(), coordinateLayer.y()];
            if (feat.feature.getGeometry().intersectsCoordinate(coord)) {
                target.push(feat);
                continue;
            }

            const closestPoint = feat.feature.getGeometry().getClosestPoint(coord);
            const distX = Math.abs(closestPoint[0] - coord[0]) / xRes;
            const distY = Math.abs(closestPoint[1] - coord[1]) / yRes;
            const distSqr = distX ** 2 + distY ** 2;
            if (distSqr <= hitToleranceSqr) {
                target.push(feat);
                continue;
            }
        }
    }
    return target;
};
Giro3dMap.prototype.getVectorFeaturesInExtent = function getVectorFeaturesInExtent(extent, target = []) {
    for (const layer of this._attachedLayers) {
        if (layer.type !== 'MaskLayer' && layer.source && layer.source instanceof VectorSource && layer.visible) {
            const layerProjection = layer.getExtent()?.crs() ?? this._instance.referenceCrs;
            const extentLayer = extent.as(layerProjection);
            const olExtent = [
                extentLayer.west(),
                extentLayer.south(),
                extentLayer.east(),
                extentLayer.north(),
            ];
            for (const feature of layer.source.source.getFeaturesInExtent(olExtent)) {
                target.push({ layer, feature });
            }
        }
    }
    return target;
};

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

/**
 * Creates a point to be added via CSS2DRenderer.
 *
 * @param {number} index Index of the point
 * @returns {HTMLElement} Point
 */
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

/**
 * Available map providers
 */
export const MAPPROVIDERS = {
    /** IGN */
    IGN: 'ign',
    /** MAPBOX */
    MAPBOX: 'mapbox',
    /** GRANDLYON */
    GRANDLYON: 'grandlyon',
};

/**
 * Mapbox key
 */
const mapboxkey = 'pk.eyJ1IjoidG11Z3VldCIsImEiOiJjbGJ4dTNkOW0wYWx4M25ybWZ5YnpicHV6In0.KhDJ7W5N3d1z3ArrsDjX_A';
const omniscalekey = 'giro3d-c0673f3a';

/**
 * Manages Giro3d layers and 3D objects
 */
class LayerManager extends EventDispatcher {
    /**
     * Creates a new layer manager.
     *
     * @param {Instance} instance Giro3D instance.
     * @param {Camera} camera Camera instance
     */
    constructor(instance, camera) {
        super();
        /** @type {Instance} */
        this.instance = instance;
        this.camera = camera;
        /** @type {Map<string, Dataset>} */
        this.sets = new Map();
        /** @type {Map<string, HTMLElement>} */
        this.progressbars = new Map();
        /** @type {Giro3dMap} */
        this.baseMap = null;
        /** @type {string} */
        this.mapProvider = MAPPROVIDERS.IGN;
        /** @type {ColorLayer} */
        this.imageryLayer = null;
        /** @type {ColorLayer} */
        this.osmLayer = null;
        /** @type {ElevationLayer} */
        this.elevationLayer = null;
        /** @type {Map<string, ColorLayer>} */
        this.overlayLayers = new Map();

        this.progressbars.set('imagery', document.getElementById('imagery-progress'));
        this.progressbars.set('osm', document.getElementById('osm-progress'));
        this.progressbars.set('elevation', document.getElementById('elevation-progress'));

        document.querySelector('#imagery .layer-toggle-visible-link').addEventListener('click', () => {
            const li = document.getElementById('imagery');
            if (this.imageryLayer.visible) {
                li.classList.add('layer-hidden');
                li.classList.remove('layer-visible');
            } else {
                li.classList.remove('layer-hidden');
                li.classList.add('layer-visible');
            }
            this.imageryLayer.visible = !this.imageryLayer.visible;
            this.instance.notifyChange(this.baseMap);
        });

        document.querySelector('#osm .layer-toggle-visible-link').addEventListener('click', () => {
            const li = document.getElementById('osm');
            if (this.osmLayer.visible) {
                li.classList.add('layer-hidden');
                li.classList.remove('layer-visible');
            } else {
                li.classList.remove('layer-hidden');
                li.classList.add('layer-visible');
            }
            this.osmLayer.visible = !this.osmLayer.visible;
            this.instance.notifyChange(this.baseMap);
        });

        this.instance.addFrameRequester(
            MAIN_LOOP_EVENTS.UPDATE_END, this._updateProgress.bind(this),
        );
    }

    _updateProgress() {
        if (this.osmLayer && !this.osmLayer.loading) {
            this.progressbars.get('osm').classList.add('d-none');
        } else {
            this.progressbars.get('osm').classList.remove('d-none');
        }

        if (this.imageryLayer && !this.imageryLayer.loading) {
            this.progressbars.get('imagery').classList.add('d-none');
        } else {
            this.progressbars.get('imagery').classList.remove('d-none');
        }

        if (this.elevationLayer && !this.elevationLayer.loading) {
            this.progressbars.get('elevation').classList.add('d-none');
        } else {
            this.progressbars.get('elevation').classList.remove('d-none');
        }

        for (const [uuid, dataset] of this.sets) {
            const p = this.progressbars.get(uuid);
            if (dataset.obj.loading) {
                p.classList.remove('d-none');
            } else {
                p.classList.add('d-none');
            }
        }
    }

    /**
     * Gets imagery layer for Giro3D; creates it if needed.
     *
     * @returns {ColorLayer} Imagery layer
     */
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
            case MAPPROVIDERS.GRANDLYON:
                source = new TileWMS({
                    url: 'https://download.data.grandlyon.com/wms/grandlyon',
                    projection: this.instance.referenceCrs,
                    params: {
                        LAYERS: ['Ortho2018_Dalle_unique_8cm_CC46'],
                        FORMAT: 'image/jpeg',
                    },
                    version: '1.3.0',
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
        this.imageryLayer.visible = false;

        return this.imageryLayer;
    }

    /**
     * Gets OSM layer for Giro3D; creates it if needed.
     *
     * @returns {ColorLayer} Imagery layer
     */
    getOSMLayer() {
        if (this.osmLayer) {
            return this.osmLayer;
        }

        const source = new TileWMS({
            url: `https://maps.omniscale.net/v2/${omniscalekey}/style.default/map`,
            projection: this.instance.referenceCrs,
            params: {
                FORMAT: 'image/png',
                SRS: this.instance.referenceCrs,
            },
            version: '1.3.0',
        });

        const giro3dsource = new TiledImageSource({ source });
        this.osmLayer = new ColorLayer(
            'osm',
            {
                source: giro3dsource,
            },
        );

        return this.osmLayer;
    }

    /**
     * Gets elevation layer for Giro3D; creates it if needed
     *
     * @returns {ElevationLayer} Elevation layer
     */
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
            case MAPPROVIDERS.GRANDLYON:
                source = new TileWMS({
                    url: 'https://download.data.grandlyon.com/wms/grandlyon',
                    projection: this.instance.referenceCrs,
                    crossOrigin: 'anonymous',
                    params: {
                        LAYERS: ['MNT2018_Altitude_2m'],
                        FORMAT: 'image/jpeg',
                    },
                    version: '1.3.0',
                });
                interpretation = Interpretation.ScaleToMinMax(149, 621);
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

    /**
     * Adds a Layer as overlay in the UI.
     *
     * @param {ColorLayer} layer Layer to add as overlay
     */
    registerOverlayLayer(layer) {
        this.overlayLayers.set(layer.id, layer);
        document.querySelector(`#overlay-${layer.id} .layer-toggle-visible-link`).addEventListener('click', () => {
            const li = document.getElementById(`overlay-${layer.id}`);
            if (layer.visible) {
                li.classList.add('layer-hidden');
                li.classList.remove('layer-visible');
            } else {
                li.classList.remove('layer-hidden');
                li.classList.add('layer-visible');
            }
            layer.visible = !layer.visible;
            this.instance.notifyChange(this.baseMap);
        });
        return this;
    }

    /**
     * Gets overlays for Giro3D; creates them if needed
     *
     * @returns {Map<string, ColorLayer>} List of overlays
     */
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
            this.registerOverlayLayer(geoJsonLayer);
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
            this.registerOverlayLayer(kmlLayer);
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
            this.registerOverlayLayer(gpxLayer);
        }

        if (!this.overlayLayers.has('gml')) {
            const gmlLayer = new ColorLayer(
                'gml',
                {
                    source: new VectorSource({
                        data: 'https://3d.oslandia.com/lyon/adr_voie_lieu.adrbornefontaine_latest.gml',
                        dataProjection: 'EPSG:4171',
                        format: new GML32(),
                        style: (feature, resolution) => new Style({
                            // Adapt size to resolution, so the shape takes approximately
                            // always the same size, and in meters :)
                            // This assumes pixelRatio of resolution is 1 and that the CRS
                            // is in meters.
                            // If true, 10 / resolution corresponds to 10 meters
                            image: new RegularShape({
                                // Radius of 5m
                                radius: 2.5 / resolution,
                                points: 4,
                                stroke: new Stroke({
                                    width: 1 / resolution,
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
            this.registerOverlayLayer(gmlLayer);
        }

        return this.overlayLayers;
    }

    /**
     * Creates/Updates current map to match the extent provided.
     *
     * @param {Extent} extent Extent to cover
     */
    createMap(extent) {
        if (this.baseMap) {
            // Already exists, we want to change the extent of the current map
            // FIXME: flash of content, probably blocked by https://gitlab.com/giro3d/giro3d/-/issues/323
            this.baseMap.removeLayer(this.imageryLayer);
            this.baseMap.removeLayer(this.osmLayer);
            this.baseMap.removeLayer(this.elevationLayer);
            Array.from(this.overlayLayers.values())
                .forEach(layer => this.baseMap.removeLayer(layer));
            this.instance.remove(this.baseMap);
        }
        if (extent.crs() !== this.instance.referenceCrs) {
            extent = extent.as(this.instance.referenceCrs);
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
        this.baseMap.addLayer(this.getOSMLayer());
        this.baseMap.addLayer(this.getElevationLayer());

        this.getVectorLayers().forEach((layer, id) => {
            layer.visible = document.getElementById(`overlay-${id}`).classList.contains('layer-visible');
            this.baseMap.addLayer(layer);
        });

        this.instance.notifyChange(this.baseMap);
        this.dispatchEvent({ type: 'map-changed' });

        return this.baseMap;
    }

    /**
     * Toggles visibility of an entity (dataset, annotation, overlay, etc.) in Giro3D.
     *
     * @param {Entity3D} entity Entity
     */
    toggleSetVisibility(entity) {
        if (this.instance.getObjects(e => e.id === entity.id).length === 0) {
            this.instance.add(entity);
        }
        const li = document.getElementById(`layer-${entity.object3d.uuid}`);
        if (entity.visible) {
            li.classList.add('layer-hidden');
            li.classList.remove('layer-visible');
        } else {
            li.classList.remove('layer-hidden');
            li.classList.add('layer-visible');
        }
        entity.visible = !entity.visible;
        this.instance.notifyChange(entity);
    }

    _createListItem(entity, filename, downloadable = false) {
        const newItem = document.createElement('li');
        newItem.setAttribute('id', `layer-${entity.object3d.uuid}`);
        newItem.className = 'layers-list-item';

        const itemContainer = document.createElement('div');
        itemContainer.className = 'layers-list-name';

        const hideBtnLink = document.createElement('a');
        hideBtnLink.setAttribute('href', '#');
        hideBtnLink.setAttribute('title', 'Hide this layer');
        hideBtnLink.className = 'link-left layer-toggle-visible-link';
        hideBtnLink.addEventListener('click', () => this.toggleSetVisibility(entity));
        hideBtnLink.innerHTML = '<i></i>';

        const link = document.createElement('a');
        link.setAttribute('href', '#');
        link.setAttribute('title', 'Zoom on this layer');
        link.className = 'layer-link';
        link.addEventListener('click', () => this.camera.lookTopDownAt(entity));
        link.textContent = filename;
        itemContainer.appendChild(link);

        const deleteBtnLink = document.createElement('a');
        deleteBtnLink.setAttribute('href', '#');
        deleteBtnLink.setAttribute('title', 'Delete this layer');
        deleteBtnLink.className = 'link-right layer-delete-link';
        deleteBtnLink.addEventListener('click', () => this.deleteSet(entity));
        deleteBtnLink.innerHTML = '<i class="bi bi-trash"></i>';

        const progressBadge = document.createElement('span');
        progressBadge.className = 'layers-list-progress';
        progressBadge.id = `layer-progress-${entity.object3d.uuid}`;
        progressBadge.innerHTML = `
<div class="spinner" role="status">
    <span class="visually-hidden">Loading...</span>
</div>`;

        newItem.appendChild(hideBtnLink);
        newItem.appendChild(itemContainer);

        if (downloadable) {
            const downloadBtnLink = document.createElement('a');
            downloadBtnLink.setAttribute('href', '#');
            downloadBtnLink.setAttribute('title', 'Download this annotation');
            downloadBtnLink.className = 'link-right layer-download-link';
            downloadBtnLink.addEventListener('click', () => this.downloadAnnotation(entity));
            downloadBtnLink.innerHTML = '<i class="bi bi-file-earmark-arrow-down"></i>';
            newItem.appendChild(downloadBtnLink);
        }

        newItem.appendChild(deleteBtnLink);
        newItem.appendChild(progressBadge);

        if (!entity.visible) {
            newItem.classList.add('layer-hidden');
        } else {
            newItem.classList.add('layer-visible');
        }
        return newItem;
    }

    /**
     * Adds an entity as a dataset in the UI.
     * Expands the map if needed this dataset is not already included in the map's extent.
     *
     * @param {Entity3D} entity Entity
     * @param {string} filename Filename
     */
    addSet(entity, filename, group = null) {
        this.sets.set(entity.object3d.uuid, { obj: entity, filename });

        const newItem = this._createListItem(entity, filename);
        let parent;
        if (group) {
            parent = document.getElementById(`layer-group-${group}`);
            if (parent === null) {
                const groupcontainer = document.createElement('li');
                groupcontainer.className = 'list-group-item py-0 px-1';

                const groupname = document.createElement('span');
                groupname.innerText = group;
                groupcontainer.appendChild(groupname);

                parent = document.createElement('ul');
                parent.id = `layer-group-${group}`;
                groupcontainer.appendChild(parent);

                document.getElementById('layer-list').appendChild(groupcontainer);
            }
        } else {
            parent = document.getElementById('layer-list');
        }
        parent.appendChild(newItem);
        this.progressbars.set(entity.object3d.uuid, document.getElementById(`layer-progress-${entity.object3d.uuid}`));

        const snapToOption = document.createElement('option');
        snapToOption.setAttribute('value', entity.object3d.uuid);
        snapToOption.textContent = filename;
        document.getElementById('snapToObject').appendChild(snapToOption);

        const bbox = entity.getBoundingBox();
        const dataExtent = Extent.fromBox3(this.instance.referenceCrs, bbox).withRelativeMargin(2);
        if (dataExtent._values.some(v => !Number.isFinite(v))) {
            console.warn(`File ${filename} has invalid bounding box/extent`, bbox, dataExtent);
        } else if (this.baseMap) {
            const newExtent = this.baseMap.extent.clone();
            if (!dataExtent.equals(newExtent) && !dataExtent.isInside(newExtent)) {
                newExtent.union(dataExtent);
                this.createMap(newExtent);
            }
        } else {
            this.createMap(dataExtent);
        }
    }

    /**
     * Adds an entity as annotation in the UI.
     *
     * @param {Entity3D} entity Entity
     */
    addAnnotationSet(entity) {
        const filename = `annotation-${entity.object3d.uuid}`;
        this.sets.set(entity.object3d.uuid, { obj: entity, filename });

        const newItem = this._createListItem(entity, filename, true);
        document.getElementById('annotation-list').appendChild(newItem);
        this.progressbars.set(entity.object3d.uuid, document.getElementById(`layer-progress-${entity.object3d.uuid}`));
    }

    /**
     * Deletes an entity from the UI
     *
     * @param {Entity3D} entity Entity
     */
    deleteSet(entity) {
        this.sets.delete(entity.object3d.uuid);
        this.progressbars.delete(entity.object3d.uuid);
        document.getElementById(`layer-${entity.object3d.uuid}`).remove();
        this.instance.remove(entity);
        if (typeof entity.dispose === 'function') {
            entity.dispose();
        }

        const select = document.getElementById('snapToObject');
        Array.from(select.children).forEach(v => {
            if (v.getAttribute('value') === entity.object3d.uuid) {
                select.removeChild(v);
            }
        });

        if (this.sets.size === 0) {
            this.baseMap.removeLayer(this.imageryLayer);
            this.baseMap.removeLayer(this.elevationLayer);
            Array.from(this.overlayLayers.values())
                .forEach(layer => this.baseMap.removeLayer(layer));
            this.instance.remove(this.baseMap);
            this.baseMap = null;
        }
    }

    /**
     * Creates a new annotation from GeoJSON data.
     *
     * @param {object} geojson GeoJSON geometry
     * @param {?boolean} [add=true] If true, adds to Giro3D scene.
     * @returns {Entity3D} Entity created
     */
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

    /**
     * Tells the browser to download an annotation as GeoJSON data.
     *
     * @param {Entity3D} entity Entity to download
     */
    downloadAnnotation(entity) {
        /** @type {Drawing} */
        // @ts-ignore
        const annotation = entity.object3d;
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

    /**
     * Gets the datasets & annotations as Object3D.
     *
     * @returns {Object3D[]} Datasets as Object3D
     */
    getObjects3d() {
        return Array.from(this.sets.values()).map(v => v.obj.object3d);
    }

    /**
     * Gets bounding box of all datasets & annotations.
     *
     * @returns {Box3} Bounding box of all datasets.
     */
    getBoundingBox() {
        const bbox = new Box3();
        const bbox2 = new Box3();
        this.getObjects3d().forEach(obj => {
            bbox2.setFromObject(obj);
            bbox.union(bbox2);
        });
        return bbox;
    }

    /**
     * Gets the closest dataset object from where the user clicked.
     * Does **NOT** pick on the base map!
     *
     * @param {MouseEvent} e Mouse event
     * @param {number} radius Radius - the smaller, the faster and more precise (but
     * may return nothing)
     * @returns {PickResult|null} Result or null if notthing found
     */
    getObjectAt(e, radius = 1) {
        const picked = this.instance.pickObjectsAt(e, {
            radius,
            where: this.getObjects3d(),
        }).filter(p => p.layer === null || p.layer.type !== 'Map')
            .sort((a, b) => (a.distance - b.distance))
            .at(0);

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

    getVectorFeatureAt(e, radius = 1) {
        const pickedOnMap = this.instance.pickObjectsAt(e, { limit: 1, radius }).at(0);
        if (pickedOnMap && pickedOnMap.layer?.type === 'Map') {
            const coord = pickedOnMap.coord;
            const parentMap = pickedOnMap.layer;
            const tile = pickedOnMap.object;

            const feature = parentMap.getVectorFeaturesAtCoordinate(coord, 10, tile).at(0);
            if (feature) {
                return {
                    layer: feature.layer,
                    feature: feature.feature,
                    rootobj: parentMap.object3d,
                };
            }
        }
        return null;
    }

    getFirstFeatureAt(e, radius = 1) {
        const picked = this.getObjectAt(e, radius);
        if (picked) {
            return picked;
        }

        const pickedOnMap = this.getVectorFeatureAt(e, radius);
        if (pickedOnMap) {
            return pickedOnMap;
        }

        return null;
    }

    /**
     * Returns whether there are datasets registered or not.
     *
     * @returns {boolean} `true` if at least 1 dataset added.
     */
    hasData() {
        return this.sets.size > 0;
    }

    /**
     * Returns whether a dataset is registered.
     *
     * @param {string} id Id
     * @returns {boolean} `true` if dataset is added
     */
    has(id) {
        if (id === 'basemap') return this.baseMap !== null;
        return this.sets.has(id);
    }

    /**
     * Returns a registered dataset
     *
     * @param {string} id Id
     * @returns {Dataset|Giro3dMap|undefined} Dataset, basemap, or undefined if not found
     */
    get(id) {
        if (id === 'basemap') return this.baseMap;
        return this.sets.get(id);
    }
}

export default LayerManager;
