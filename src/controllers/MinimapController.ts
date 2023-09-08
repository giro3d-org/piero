import OSM from 'ol/source/OSM'
import GiroMap from '@giro3d/giro3d/entities/Map.js'
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource.js'
import Extent from '@giro3d/giro3d/core/geographic/Extent.js'
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer'
import Instance from '@giro3d/giro3d/core/Instance'
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates'
import Map from '@giro3d/giro3d/entities/Map.js'
import Viewbox from '@/types/Viewbox'
import MainController from './MainController'
import { Vector3, Vector2, Box3, MathUtils } from 'three'

const DEFAULT_EXTENT = new Extent(
    'EPSG:3857',
    -20037508.342789244, 20037508.342789244,
    -20037508.342789244, 20037508.342789244,
);

function loadOSMLayer(map: Map) {
    const layer = new ColorLayer('osm', {
        source: new TiledImageSource({ source: new OSM() }),
    });

    layer.visible = true;

    map.addLayer(layer);
}

function loadMinimap(div: HTMLDivElement) {
    MainController.onInit(ctrl => {
        minimapController = new MinimapController(div, ctrl);
    });
}

export default {
    loadMinimap
}

let minimapController : MinimapController;

class MinimapController {
    private readonly mainInstance: Instance;
    private readonly minimapInstance: Instance;
    private readonly viewbox: Viewbox;
    private readonly basemap: Map;

    constructor(div: HTMLDivElement, mainController: MainController) {
        this.mainInstance = mainController.mainInstance;

        mainController.addEventListener('update', () => {
            this.updateViewbox();
        });

        this.minimapInstance = new Instance(div, {
            crs: 'EPSG:3857',
            renderer: {
                clearColor: 0xcccccc,
            },
        })

        this.viewbox = new Viewbox();

        this.minimapInstance.scene.add(this.viewbox.object3D);

        this.viewbox.object3D.updateMatrixWorld();

        this.minimapInstance.notifyChange()

        this.basemap = new GiroMap('minimap', {
            extent: DEFAULT_EXTENT,
        })

        this.minimapInstance.add(this.basemap);

        loadOSMLayer(this.basemap);

        const center = new Coordinates('EPSG:4326', 4.84, 45.76).as(this.minimapInstance.referenceCrs) as Coordinates;

        const xyz = new Vector3(center.x(), center.y(), 0);
        const camera = this.minimapInstance.camera.camera3D;
        camera.position.set(xyz.x, xyz.y, 20000);
        camera.lookAt(xyz.x, xyz.y + 1, 0);

       this.minimapInstance.notifyChange()
    }

    getCorners() {
        const instance = this.mainInstance;
        const minimapInstance = this.minimapInstance;
        const canvasSize = instance.mainLoop.gfxEngine.getWindowSize();
        const camera = instance.camera.camera3D;

        function raycast(x: number, y: number) {
            const results = instance.pickObjectsAt(new Vector2(x, y), { limit: 1, radius: 0 });
            const point = results.at(0)?.point;
            if (point) {
                const result = new Coordinates(instance.referenceCrs, point.x, point.y, 1)
                    .as(minimapInstance.referenceCrs)
                    .xyz();

                result.z = 1;

                return result;
            }
            return undefined;
        }

        const ul = raycast(0, 0);
        const ur = raycast(canvasSize.x - 1, 0);
        const ll = raycast(0, canvasSize.y - 1);
        const lr = raycast(canvasSize.x - 1, canvasSize.y - 1);

        if (!ul || !ur || !ll || !lr) {
            return undefined;
        }

        return { ul, ur, ll, lr }
    }

    updateViewbox() {
        let corners = this.getCorners();
        const mainCamera = this.mainInstance.camera.camera3D;
        const minimapCamera = this.minimapInstance.camera.camera3D;

        if (corners) {
            this.viewbox.object3D.visible = true;
            const { ul, ur, ll, lr } = corners;
            this.viewbox.setCorners(ul, ur, lr, ll);
            const box = new Box3();
            box.setFromPoints([ul, ur, ll, lr]);
            const xyz = box.getCenter(new Vector3());
            const altitude = mainCamera.position.z + 2000;
            minimapCamera.position.set(xyz.x, xyz.y, MathUtils.clamp(altitude, 1000, 50000));
            minimapCamera.lookAt(xyz.x, xyz.y + 1, 0);

        } else {
            this.viewbox.object3D.visible = false;

            const xyz = mainCamera.position;
            const coordinate = new Coordinates(this.mainInstance.referenceCrs, xyz.x, xyz.y, 0)
                .as(this.minimapInstance.referenceCrs) as Coordinates;

            const x = coordinate.x();
            const y = coordinate.y();
            minimapCamera.position.set(x, y, minimapCamera.position.z);
            minimapCamera.lookAt(x, y + 1, 0);
        }

        this.minimapInstance.notifyChange(this.basemap);
    }
}