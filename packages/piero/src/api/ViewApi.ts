import type Instance from '@giro3d/giro3d/core/Instance';

import { isEntity3D } from '@giro3d/giro3d/entities/Entity3D';
import { Box3 } from 'three';

import type CameraController from '@/services/CameraController';
import type SceneCursorManager from '@/services/SceneCursorManager';

/** @internal */
export class ViewApiImpl implements ViewApi {
    private readonly _cameraController: CameraController;
    private readonly _instance: Instance;
    private readonly _sceneCursorManager: SceneCursorManager;

    public constructor(params: {
        camera: CameraController;
        instance: Instance;
        sceneCursorManager: SceneCursorManager;
    }) {
        this._cameraController = params.camera;
        this._instance = params.instance;
        this._sceneCursorManager = params.sceneCursorManager;
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
    getBoundingBox(): Box3;
    getCameraController(): CameraController;
    getInstance(): Instance;
    getSceneCursorManager(): SceneCursorManager;
}
