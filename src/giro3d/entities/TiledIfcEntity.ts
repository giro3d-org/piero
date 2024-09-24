import { Box3, Sphere } from 'three';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';

import { fillObject3DUserData } from '@/loaders/userData';
import type { UrlMixin } from '../sources/mixins';

/** Parameters for creating {@link TiledIfcEntity} */
export interface TiledIfcSource extends UrlMixin {}

export default class TiledIfcEntity extends Tiles3D {
    constructor(parameters: TiledIfcSource) {
        super(new Tiles3DSource(parameters.url));
        fillObject3DUserData(this, { filename: parameters.url });
    }

    getBoundingBox(): Box3 | null {
        // For some reason, this.object3d's bounding box is infinite
        if (this.root) {
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
        }

        return super.getBoundingBox();
    }
}
