import Instance from "@giro3d/giro3d/core/Instance";
import Coordinates from "@giro3d/giro3d/core/geographic/Coordinates";
import Extent from "@giro3d/giro3d/core/geographic/Extent";
import ColorLayer from "@giro3d/giro3d/core/layer/ColorLayer";
import ElevationLayer from "@giro3d/giro3d/core/layer/ElevationLayer";
import Layer from "@giro3d/giro3d/core/layer/Layer";
import Map from "@giro3d/giro3d/entities/Map";
import { EventDispatcher, GridHelper, Material, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from "three";
import VectorSource from "@giro3d/giro3d/sources/VectorSource";
import TileIndex from "@giro3d/giro3d/core/TileIndex";
import { useGiro3dStore } from "@/stores/giro3d";

// Workaround performance issue.
// TODO remove when https://gitlab.com/giro3d/giro3d/-/merge_requests/418 is merged
Layer.prototype.loadFallbackImages = function doNothing() {
    return Promise.resolve();
}

// Patch Giro3D, remove me when https://gitlab.com/giro3d/giro3d/-/issues/168 is closed
// @ts-ignore
Map.prototype.getVectorFeaturesAtCoordinate = function getVectorFeaturesAtCoordinate(
    coordinate: Coordinates,
    hitTolerance = 0,
    tileHint = undefined,
    target: any[] = [],
) {
    if (hitTolerance === 0) {
        // @ts-ignore
        for (const layer of this._attachedLayers) {
            if (layer.type !== 'MaskLayer' && layer.source && layer.source instanceof VectorSource && layer.visible) {
                const coordinateLayer = coordinate.as(layer.extent.crs());
                const coord = [coordinateLayer.x, coordinateLayer.y];
                for (const feature of layer.source.source.getFeaturesAtCoordinate(coord)) {
                    target.push({ layer, feature });
                }
            }
        }
    } else {
        let tile: any = tileHint;
        if (!tile) {
            tile = this.tileIndex.tiles?.get(TileIndex.getKey(0, 0, 0))?.deref();
            for (const t of this.tileIndex.tiles) {
                const n = t[1].deref();
                if (n && n.material && n.material.visible && (n as any).extent.isPointInside(coordinate)) {
                    tile = n;
                    break;
                }
            }
        }
        if (!tile) return [];

        const tileLayer = tile.extent.as(coordinate.crs);

        const tileExtent = tileLayer.dimensions();
        // @ts-ignore
        const imageSize = this.imageSize;
        const xRes = tileExtent.x / imageSize.x;
        const yRes = tileExtent.y / imageSize.y;
        const hitToleranceSqr = hitTolerance ** 2;

        const e = new Extent(
            coordinate.crs,
            coordinate.x - xRes * hitTolerance,
            coordinate.x + xRes * hitTolerance,
            coordinate.y - yRes * hitTolerance,
            coordinate.y + yRes * hitTolerance,
        );

        // @ts-ignore
        const features = this.getVectorFeaturesInExtent(e);
        for (const feat of features) {
            // @ts-ignore
            const layerProjection = feat.layer.getExtent()?.crs() ?? this._instance.referenceCrs;
            const coordinateLayer = coordinate.as(layerProjection);
            const coord = [coordinateLayer.x, coordinateLayer.y];
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

// @ts-ignore
Map.prototype.getVectorFeaturesInExtent = function getVectorFeaturesInExtent(extent, target: any[] = []) {
    // @ts-ignore
    for (const layer of this._attachedLayers) {
        if (layer.type !== 'MaskLayer' && layer.source && layer.source instanceof VectorSource && layer.visible) {
            // @ts-ignore
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
    private basemap!: Map;
    private readonly giro3dStore = useGiro3dStore();
    private grid!: GridHelper;
    private plane!: Mesh;

    private readonly baseLayerOrdering: Set<string> = new Set();
    private readonly overlayOrdering: Set<string> = new Set();

    constructor(instance: Instance) {
        super();

        this.instance = instance;

        const extent = this.giro3dStore.getDefaultBasemapExtent(instance.referenceCrs);

        this.createMap(extent);
    }

    setExtent(extent: Extent) {
        const layers = this.basemap.getLayers();
        this.instance.remove(this.basemap);
        this.grid.dispose();
        this.grid.remove();
        this.plane.geometry.dispose();
        this.plane.remove();
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

        const dims = extent.dimensions();

        this.grid = new GridHelper(1, 100);
        this.grid.name = 'grid';
        this.grid.scale.set(dims.x, 1, dims.y);
        this.grid.visible = true;
        const center = extent.center();
        this.grid.position.set(center.x, center.y, -100);
        this.grid.rotateOnAxis(new Vector3(1, 0, 0,), Math.PI / 2);
        const gridMat = this.grid.material as Material;
        gridMat.opacity = 0.5;
        gridMat.transparent = true;

        this.plane = new Mesh(new PlaneGeometry(dims.x, dims.y, 1, 1), new MeshBasicMaterial({ color: 'black' }));
        this.plane.name = 'plane';
        this.plane.position.set(center.x, center.y, -101);

        this.instance.add(this.basemap);
        this.instance.add(this.grid);
        this.instance.add(this.plane);

        this.grid.updateMatrixWorld();
        this.plane.updateMatrixWorld();

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

    setMapOpacity(opacity: number) {
        this.basemap.opacity = opacity;
        this.instance.notifyChange(this.basemap);
    }

    addElevationLayer(layer: ElevationLayer) {
        this.basemap.addLayer(layer);
        layer.addEventListener('visible-property-changed', () => {
            this.basemap.visible = layer.visible;
            this.instance.notifyChange(this.basemap);
        })
    }

    addBaseLayer(layer: ColorLayer) {
        this.basemap.addLayer(layer);
        this.baseLayerOrdering.add(layer.id);
        this.updateLayerOrdering();
    }

    addOverlay(layer: ColorLayer) {
        this.basemap.addLayer(layer);
        this.overlayOrdering.add(layer.id);
        this.updateLayerOrdering();
    }

    moveOverlayDown(overlay: ColorLayer) {
        this.basemap.moveLayerDown(overlay);
    }

    moveOverlayUp(overlay: ColorLayer) {
        this.basemap.moveLayerUp(overlay);
    }

    private updateLayerOrdering() {
        const overlays = this.overlayOrdering;
        const layers = this.baseLayerOrdering;
        this.basemap.sortColorLayers((a: Layer, b: Layer) => {
            if (overlays.has(a.id) && layers.has(b.id)) {
                return 1;
            }
            if (overlays.has(b.id) && layers.has(a.id)) {
                return -1;
            }
            return 0;
        });
    }
}
