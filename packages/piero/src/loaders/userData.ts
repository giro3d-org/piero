import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import { type Object3D } from 'three';

/** User data to be set on the loaded entities */
export interface UserData {
    /** File that the entity was loaded from */
    filename?: string | null;
}

export function fillObject3DUserData(root: Object3D | Entity3D, userData: UserData): void {
    const obj3d = (root as Entity3D).isEntity3D ? (root as Entity3D).object3d : root;
    if (!('dataset' in obj3d.userData)) {
        obj3d.userData.dataset = {};
    }

    for (const [key, value] of Object.entries(userData)) {
        obj3d.userData.dataset[key] = value;
    }
}
