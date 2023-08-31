import Instance from "@giro3d/giro3d/core/Instance";
import Coordinates from "@giro3d/giro3d/core/geographic/Coordinates";
import Extent from "@giro3d/giro3d/core/geographic/Extent";
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer";
import ElevationLayer from "@giro3d/giro3d/core/layer/ElevationLayer";
import Layer from "@giro3d/giro3d/core/layer/Layer";
import Map from "@giro3d/giro3d/entities/Map";
import { Feature } from "ol";
import { EventDispatcher } from "three";
import NotificationController from "./NotificationController";
import VectorSource from "@giro3d/giro3d/sources/VectorSource";
import TileIndex from "@giro3d/giro3d/core/TileIndex";


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
Map.prototype.getVectorFeaturesAtCoordinate = function getVectorFeaturesAtCoordinate(
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
                for (const feature of layer.source.source.getFeaturesAtCoordinate(coord)) {
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

Map.prototype.getVectorFeaturesInExtent = function getVectorFeaturesInExtent(extent, target = []) {
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

export default class LayerManager extends EventDispatcher {
    private readonly instance: Instance;
    private basemap: Map;

    constructor(instance: Instance) {
        super();

        this.instance = instance;

        const center = new Coordinates('EPSG:4326', 4.84, 45.76).as(instance.referenceCrs).xyz();
        const extent = Extent.fromCenterAndSize(instance.referenceCrs, { x: center.x, y: center.y }, 30000, 30000);

        this.createMap(extent);
    }

    setExtent(extent: Extent) {
        const layers = this.basemap.getLayers();
        this.instance.remove(this.basemap);
        this.createMap(extent, layers);
    }

    private createMap(extent: Extent, layers?: Layer[]) {
        this.basemap = new Map('basemaps', {
            extent,
            hillshading: {
                enabled: true,
                elevationLayersOnly: true,
            },
            doubleSided: true,
            segments: 128,
            backgroundColor: 'white',
        });

        this.instance.add(this.basemap);

        NotificationController.showNotification('Basemaps', 'Basemaps created');

        if (layers) {
            for (const layer of layers) {
                this.basemap.addLayer(layer);
            }
        }
    }

    notify(layer: Layer) {
        this.instance.notifyChange(layer);
    }

    get extent() {
        return this.basemap.extent;
    }

    addElevationLayer(layer: ElevationLayer) {
        this.basemap.addLayer(layer);
    }

    addBaseLayer(layer: ColorLayer) {
        this.basemap.addLayer(layer);
    }

    addOverlay(layer: ColorLayer) {
        this.basemap.addLayer(layer);
    }

    moveOverlayDown(overlay: ColorLayer) {
        this.basemap.moveLayerDown(overlay);
    }

    moveOverlayUp(overlay: ColorLayer) {
        this.basemap.moveLayerUp(overlay);
    }
}