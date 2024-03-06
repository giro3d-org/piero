import Instance from '@giro3d/giro3d/core/Instance';
import Extent from '@giro3d/giro3d/core/geographic/Extent';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import ElevationLayer from '@giro3d/giro3d/core/layer/ElevationLayer';
import Layer from '@giro3d/giro3d/core/layer/Layer';
import Map from '@giro3d/giro3d/entities/Map';
import {
    EventDispatcher,
    GridHelper,
    Material,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    Vector3,
} from 'three';
import { useCameraStore } from '@/stores/camera';
import { useGiro3dStore } from '@/stores/giro3d';

// Hide the grid when above this altitude threshold
const GRID_ALTITUDE_THRESHOLD = 3000;
export const GRID_NAME = 'grid';
export const PLANE_NAME = 'plane';

export default class LayerManager extends EventDispatcher {
    private readonly instance: Instance;
    private basemap!: Map;
    private readonly cameraStore = useCameraStore();
    private readonly giro3dStore = useGiro3dStore();
    private grid!: GridHelper;
    private plane!: Mesh;

    private readonly baseLayerOrdering: Set<string> = new Set();
    private readonly overlayOrdering: Set<string> = new Set();

    constructor(instance: Instance) {
        super();

        this.instance = instance;

        const extent = this.giro3dStore.getDefaultBasemapExtent();

        this.createMap(extent);

        this.instance.addEventListener('after-camera-update', () => {
            this.onAfterCameraUpdate();
        });
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
        this.grid.name = GRID_NAME;
        this.grid.scale.set(dims.x, 1, dims.y);
        this.grid.visible = true;
        const center = extent.center();
        this.grid.position.set(center.x, center.y, -100);
        this.grid.rotateOnAxis(new Vector3(1, 0, 0), Math.PI / 2);
        const gridMat = this.grid.material as Material;
        gridMat.opacity = 0.5;
        gridMat.transparent = true;

        this.plane = new Mesh(
            new PlaneGeometry(dims.x, dims.y, 1, 1),
            new MeshBasicMaterial({ color: 'black' }),
        );
        this.plane.name = PLANE_NAME;
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

    private onAfterCameraUpdate() {
        const pos = this.cameraStore.getCamera3dPosition();
        const oldVisible = this.grid.visible;
        const newVisible = pos.z < GRID_ALTITUDE_THRESHOLD;

        if (oldVisible !== newVisible) {
            this.grid.visible = newVisible;
            this.plane.visible = newVisible;
            this.instance.notifyChange(this.grid);
            this.instance.notifyChange(this.plane);
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
        });
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
