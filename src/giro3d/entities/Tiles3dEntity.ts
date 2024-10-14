import { fillObject3DUserData } from '@/loaders/userData';
import type { Tiles3DOptions } from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';
import type { Material } from 'three';
import { Box3, Sphere } from 'three';
import type { UrlMixin } from '../sources/mixins';

/** Parameters for creating {@link Tiles3dEntity} */
export interface Tiles3dSource extends UrlMixin {}

/**
 * Entity for displaying 3D-Tiles files
 */
export default class Tiles3dEntity extends Tiles3D {
    constructor(parameters: Tiles3dSource, options?: Tiles3DOptions<Material>) {
        super(new Tiles3DSource(parameters.url), options);
        fillObject3DUserData(this, { filename: parameters.url });
    }

    getBoundingBox(): Box3 | null {
        // Workaround for https://gitlab.com/giro3d/giro3d/-/issues/527
        const boundingVolume = this.root.boundingVolume;
        if (boundingVolume.box) {
            const box = new Box3().copy(boundingVolume.box).applyMatrix4(this.root.matrixWorld);
            return box;
        }
        if (boundingVolume.sphere) {
            const sphere = new Sphere()
                .copy(boundingVolume.sphere)
                .applyMatrix4(this.root.matrixWorld);
            const box = new Box3();
            sphere.getBoundingBox(box);
            return box;
        }

        return super.getBoundingBox();
    }
}
