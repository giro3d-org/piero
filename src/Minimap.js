import {
    MathUtils, BufferGeometry, LineBasicMaterial, LineSegments,
} from 'three';
import Instance from '@giro3d/giro3d/core/Instance.js';
import Giro3dMap from '@giro3d/giro3d/entities/Map.js';
import { MAIN_LOOP_EVENTS } from '@giro3d/giro3d/core/MainLoop.js';
import TileWMS from 'ol/source/TileWMS.js';
import TiledImageSource from '@giro3d/giro3d/sources/TiledImageSource.js';
import ColorLayer from '@giro3d/giro3d/core/layer/ColorLayer.js';

const omniscalekey = 'giro3d-c0673f3a';

class Minimap {
    constructor(instance, layerManager) {
        this.instance = instance;
        this.layerManager = layerManager;

        this.minimapInstance = new Instance(document.getElementById('minimap'), {
            crs: this.instance.referenceCrs,
        });
        this.minimapInstance.camera.camera3D.rotateZ(Math.PI / 2);
        this.minimapInstance.camera.camera3D.updateMatrixWorld();

        const map = new Giro3dMap('planar', { extent: this.layerManager.baseMap.extent });
        this.minimapInstance.add(map);
        map.addLayer(new ColorLayer(
            'osm',
            {
                source: new TiledImageSource({
                    source: new TileWMS({
                        url: `https://maps.omniscale.net/v2/${omniscalekey}/style.default/map`,
                        projection: this.instance.referenceCrs,
                        params: {
                            FORMAT: 'image/png',
                            SRS: this.instance.referenceCrs,
                        },
                        version: '1.3.0',
                    }),
                }),
            },
        ));

        this.cube = new LineSegments(
            new BufferGeometry(),
            new LineBasicMaterial({ color: 0x0000ff, opacity: 1 }),
        );
        this.cube.position.set(0, 0, 1);
        this.cube.updateMatrixWorld();
        this.minimapInstance.scene.add(this.cube);

        this.line2 = new LineSegments(
            new BufferGeometry(),
            new LineBasicMaterial({ color: 0xff0000 }),
        );
        this.line2.position.set(0, 0, 1);
        this.line2.updateMatrixWorld();
        this.minimapInstance.scene.add(this.line2);

        this.minimapInstance.camera.camera3D.position.set(0, 0, 25000000);

        this.instance.addFrameRequester(
            MAIN_LOOP_EVENTS.UPDATE_END, this.update.bind(this),
        );
    }

    getMainExtent() {
        const canvasSize = this.instance.mainLoop.gfxEngine.getWindowSize();

        const topLeft = this.layerManager.baseMap.pickObjectsAt(
            { x: 0, y: 0 },
            { limit: 1, radius: 0 },
        ).at(0)?.point;
        const topRight = this.layerManager.baseMap.pickObjectsAt(
            { x: canvasSize.x - 1, y: 0 },
            { limit: 1, radius: 0 },
        ).at(0)?.point;
        const bottomLeft = this.layerManager.baseMap.pickObjectsAt(
            { x: 0, y: canvasSize.y - 1 },
            { limit: 1, radius: 0 },
        ).at(0)?.point;
        const bottomRight = this.layerManager.baseMap.pickObjectsAt(
            { x: canvasSize.x - 1, y: canvasSize.y - 1 },
            { limit: 1, radius: 0 },
        ).at(0)?.point;

        const xMin = Math.min(topLeft?.x, topRight?.x, bottomLeft?.x, bottomRight?.x);
        const xMax = Math.max(topLeft?.x, topRight?.x, bottomLeft?.x, bottomRight?.x);
        const yMin = Math.min(topLeft?.y, topRight?.y, bottomLeft?.y, bottomRight?.y);
        const yMax = Math.max(topLeft?.y, topRight?.y, bottomLeft?.y, bottomRight?.y);

        return {
            xMin, xMax, yMin, yMax, topLeft, topRight, bottomLeft, bottomRight,
        };
    }

    update() {
        const extent = this.getMainExtent();

        const centerX = (extent.xMin + extent.xMax) / 2;
        const centerY = (extent.yMin + extent.yMax) / 2;

        const extentWidth = extent.xMax - extent.xMin;
        const extentHeight = extent.yMax - extent.yMin;

        if (extent.topLeft && extent.topRight && extent.bottomLeft && extent.bottomRight) {
            this.cube.geometry.setFromPoints([
                extent.topLeft,
                extent.bottomLeft,
                extent.bottomLeft,
                extent.bottomRight,
                extent.bottomRight,
                extent.topRight,
                extent.topRight,
                extent.topLeft,
            ]);
            this.cube.geometry.computeBoundingBox();
            this.cube.geometry.computeBoundingSphere();
            this.minimapInstance.notifyChange(this.cube);

            const cameraPos = this.instance.camera.camera3D.position.clone();
            cameraPos.z = 1;
            this.line2.geometry.setFromPoints([
                extent.bottomLeft, cameraPos,
                cameraPos, extent.bottomRight,
                extent.topLeft, cameraPos,
                cameraPos, extent.topRight,
            ]);
            this.line2.geometry.computeBoundingBox();
            this.line2.geometry.computeBoundingSphere();
            this.minimapInstance.notifyChange(this.line2);
        }

        const diagonalDistance = Math.sqrt(extentWidth ** 2 + extentHeight ** 2);
        const fieldOfView = MathUtils.degToRad(this.minimapInstance.camera.camera3D.fov);
        const distance = diagonalDistance / (2 * Math.tan(fieldOfView / 2)) + diagonalDistance / 10;

        this.minimapInstance.camera.camera3D.position.set(centerX, centerY, distance);
        this.minimapInstance.camera.camera3D.lookAt(centerX, centerY, 0);
        this.minimapInstance.camera.camera3D.rotateZ(-Math.PI / 2);

        this.minimapInstance.camera.camera3D.updateProjectionMatrix();
        this.minimapInstance.camera.camera3D.updateMatrixWorld();
        this.minimapInstance.notifyChange(this.minimapInstance.camera.camera3D);
    }
}

export default Minimap;
