import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';
import PointCloudMaterial, { MODE } from '@giro3d/giro3d/renderer/PointCloudMaterial';

import { getColorMap } from '@/utils/Configuration';
import config from '@/config';
import { fillObject3DUserData } from '@/loaders/userData';
import type { UrlMixin } from '../sources/mixins';

/** Parameters for creating {@link TiledPointCloudEntity} */
export interface TiledPointCloudSource extends UrlMixin {
    name: string;
}

export default class TiledPointCloudEntity extends Tiles3D {
    constructor(parameters: TiledPointCloudSource) {
        const material = new PointCloudMaterial({
            size: 2,
            mode: MODE.ELEVATION,
        });
        material.colorMap = getColorMap(config.pointcloud);

        super(new Tiles3DSource(parameters.url), {
            material,
        });
        this.name = `pointcloud-${parameters.name}`;
        fillObject3DUserData(this, { filename: parameters.url });
    }
}
