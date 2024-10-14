import Viewbox from '@/types/Viewbox';
import type Instance from '@giro3d/giro3d/core/Instance';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Extent from '@giro3d/giro3d/core/geographic/Extent.js';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer';
import type Map from '@giro3d/giro3d/entities/Map.js';
import GiroMap from '@giro3d/giro3d/entities/Map.js';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource.js';
import OSM from 'ol/source/OSM';
import { Vector2, Vector3 } from 'three';

const DEFAULT_EXTENT = new Extent(
    'EPSG:3857',
    -20037508.342789244,
    20037508.342789244,
    -20037508.342789244,
    20037508.342789244,
);

function loadOSMLayer(map: Map) {
    const layer = new ColorLayer({
        name: 'osm',
        source: new TiledImageSource({ source: new OSM() }),
    });

    layer.visible = true;

    map.addLayer(layer);
}

export default class MinimapController {
    private _mainInstance: Instance | null;
    private readonly _minimapInstance: Instance;
    private readonly _viewbox: Viewbox;
    private readonly _basemap: Map;
    private _boundUpdateViewbox: () => void;

    constructor(instance: Instance) {
        this._mainInstance = null;
        this._minimapInstance = instance;

        this._viewbox = new Viewbox();

        this._minimapInstance.scene.add(this._viewbox.object3D);

        this._viewbox.object3D.updateMatrixWorld();

        this._minimapInstance.notifyChange();

        this._basemap = new GiroMap({
            extent: DEFAULT_EXTENT,
        });
        this._basemap.name = 'minimap';

        this._minimapInstance.add(this._basemap);

        loadOSMLayer(this._basemap);

        const center = new Coordinates('EPSG:4326', 4.84, 45.76).as(
            this._minimapInstance.referenceCrs,
        );

        const xyz = new Vector3(center.x, center.y, 0);
        const camera = this._minimapInstance.view.camera;
        camera.position.set(xyz.x, xyz.y, 20000);
        camera.lookAt(xyz.x, xyz.y + 1, 0);

        this._minimapInstance.notifyChange();
        this._boundUpdateViewbox = this.updateViewbox.bind(this);
    }

    dispose() {
        if (this._mainInstance) {
            this._mainInstance.removeEventListener('after-camera-update', this._boundUpdateViewbox);
        }

        this._minimapInstance.remove(this._basemap);
        this._minimapInstance.scene.remove(this._viewbox.object3D);

        this._basemap.dispose();
        this._viewbox.geometry.dispose();
        this._viewbox.object3D.geometry.dispose();
        this._viewbox.object3D.material.dispose();
    }

    setMainInstance(instance: Instance | null) {
        if (this._mainInstance) {
            this._mainInstance.removeEventListener('after-camera-update', this._boundUpdateViewbox);
        }
        this._mainInstance = instance;
        if (instance) {
            instance.addEventListener('after-camera-update', this._boundUpdateViewbox);
        }
    }

    getCorners() {
        const instance = this._mainInstance;
        const minimapInstance = this._minimapInstance;

        if (instance === null) {
            throw new Error('Must call setMainInstance before getCorners');
        }

        const canvasSize = instance.engine.getWindowSize();

        const raycast = (x: number, y: number) => {
            const results = instance.pickObjectsAt(new Vector2(x, y), { limit: 1, radius: 0 });
            const point = results.at(0)?.point;
            if (point) {
                const result = new Coordinates(instance.referenceCrs, point.x, point.y, 1)
                    .as(minimapInstance.referenceCrs)
                    .toVector3();

                result.z = 1;

                return result;
            }
            return undefined;
        };

        const ul = raycast(0, 0);
        const ur = raycast(canvasSize.x - 1, 0);
        const ll = raycast(0, canvasSize.y - 1);
        const lr = raycast(canvasSize.x - 1, canvasSize.y - 1);

        if (!ul || !ur || !ll || !lr) {
            return undefined;
        }

        return { ul, ur, ll, lr };
    }

    updateViewbox() {
        // Disabled as it consumes too much CPU
        // let corners = this.getCorners();
        if (this._mainInstance === null) {
            throw new Error('Must call setMainInstance before updateViewbox');
        }

        // const corners = null;
        const mainCamera = this._mainInstance.view.camera;
        const minimapCamera = this._minimapInstance.view.camera;

        // if (corners) {
        //     this._viewbox.object3D.visible = true;
        //     const { ul, ur, ll, lr } = corners;
        //     this._viewbox.setCorners(ul, ur, lr, ll);
        //     const box = new Box3();
        //     box.setFromPoints([ul, ur, ll, lr]);
        //     const xyz = box.getCenter(new Vector3());
        //     const altitude = mainCamera.position.z + 2000;
        //     minimapCamera.position.set(xyz.x, xyz.y, MathUtils.clamp(altitude, 1000, 50000));
        //     minimapCamera.lookAt(xyz.x, xyz.y + 1, 0);
        // } else {
        this._viewbox.object3D.visible = false;

        const xyz = mainCamera.position;
        const coordinate = new Coordinates(this._mainInstance.referenceCrs, xyz.x, xyz.y, 0).as(
            this._minimapInstance.referenceCrs,
        );

        const { x, y } = coordinate;
        minimapCamera.position.set(x, y, minimapCamera.position.z);
        minimapCamera.lookAt(x, y + 1, 0);
        // }

        this._minimapInstance.notifyChange(this._basemap);
    }
}
