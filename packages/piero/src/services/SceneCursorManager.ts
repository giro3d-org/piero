import type Instance from '@giro3d/giro3d/core/Instance';
import type { Vector3 } from 'three';

import { CSS2DObject } from 'three/examples/jsm/Addons.js';

function createSceneCursor(className: string, id: string): CSS2DObject {
    const container = document.createElement('div');
    container.className = 'scene-cursor';
    container.id = id;
    const icon = document.createElement('i');
    icon.className = `${className} text-dark shadow`;
    container.append(icon);

    const css2DObject = new CSS2DObject(container);
    return css2DObject;
}

export type SceneCursorType = 'location' | 'orbit' | 'street';

/**
 * Handles the display of the cursor in 3D space.
 */
export default class SceneCursorManager {
    private _currentCursor: CSS2DObject | null = null;
    private readonly _instance: Instance;

    private readonly _pickingCursors: Record<SceneCursorType, CSS2DObject> = {
        location: createSceneCursor('fg-location', 'cursor-location'),
        orbit: createSceneCursor('bi bi-mouse2-fill', 'cursor-orbit'),
        street: createSceneCursor('fg-position-man', 'cursor-street'),
    };

    public constructor(instance: Instance) {
        this._instance = instance;
    }

    /**
     * Sets the cursor.
     * @param cursor - The cursor to use. If `null`, the scene cursor is removed and replaced by a regular cursor.
     */
    public setCursor(cursor: SceneCursorType | null): void {
        if (cursor == null) {
            this._instance.domElement.style.cursor = 'auto';
            this.detachCurrentCursor();
            this._currentCursor = null;
        } else {
            this._instance.domElement.style.cursor = 'none';
            const newCursor = this._pickingCursors[cursor];
            if (newCursor !== this._currentCursor) {
                this.detachCurrentCursor();
                this._currentCursor = newCursor;
                this._instance.add(this._currentCursor).catch(console.error);
            }
        }
    }

    public setCursorLocation(worldPosition: Vector3): void {
        if (this._currentCursor == null) {
            return;
        }

        this._currentCursor.position.copy(worldPosition);
        this._currentCursor.updateMatrixWorld(true);
        this._instance.notifyChange();
    }

    private detachCurrentCursor(): void {
        this._currentCursor?.parent?.remove(this._currentCursor);
    }
}
