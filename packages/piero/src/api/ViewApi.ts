import type Instance from '@giro3d/giro3d/core/Instance';
import type Map from '@giro3d/giro3d/entities/Map';

import { isEntity3D } from '@giro3d/giro3d/entities/Entity3D';
import { Box3 } from 'three';

import type CameraController from '@/services/CameraController';
import type SceneCursorManager from '@/services/SceneCursorManager';

/** @internal */
export class ViewApiImpl implements ViewApi {
    private readonly _basemap: Map;
    private readonly _cameraController: CameraController;
    private readonly _instance: Instance;
    private readonly _sceneCursorManager: SceneCursorManager;

    public constructor(params: {
        basemap: Map;
        camera: CameraController;
        instance: Instance;
        sceneCursorManager: SceneCursorManager;
    }) {
        this._basemap = params.basemap;
        this._cameraController = params.camera;
        this._instance = params.instance;
        this._sceneCursorManager = params.sceneCursorManager;
    }

    public getBasemap(): Map {
        return this._basemap;
    }

    public getBoundingBox(): Box3 {
        const entities = this._instance.getEntities();
        const bbox = new Box3().makeEmpty();

        for (const entity of entities) {
            if (isEntity3D(entity)) {
                const entityBox = entity.getBoundingBox();
                if (entityBox != null) {
                    bbox.union(entityBox);
                }
            }
        }

        return bbox;
    }

    public getCameraController(): CameraController {
        return this._cameraController;
    }

    public getInstance(): Instance {
        return this._instance;
    }

    public getSceneCursorManager(): SceneCursorManager {
        return this._sceneCursorManager;
    }
}

export default interface ViewApi {
    getBasemap(): Map;
    getBoundingBox(): Box3;
    getCameraController(): CameraController;
    getInstance(): Instance;
    getSceneCursorManager(): SceneCursorManager;
}
