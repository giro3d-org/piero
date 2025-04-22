import { fillObject3DUserData } from '@/loaders/userData';
import type { Tiles3DOptions } from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import type { UrlMixin } from '../sources/mixins';

/** Parameters for creating {@link Tiles3dEntity} */
export interface Tiles3dSource extends UrlMixin {}

/**
 * Entity for displaying 3D-Tiles files
 */
export default class Tiles3dEntity extends Tiles3D {
    constructor(parameters: Tiles3dSource, options?: Tiles3DOptions) {
        super({ ...parameters, ...options });
        fillObject3DUserData(this, { filename: parameters.url });
    }
}
