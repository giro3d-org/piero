import PointCloudMaterial, { MODE } from '@giro3d/giro3d/renderer/PointCloudMaterial';

import { getColorMap } from '@/utils/Configuration';
import config from '@/config';
import Tiles3dEntity, { Tiles3dSource } from './Tiles3dEntity';

/** Parameters for creating {@link TiledPointCloudEntity} */
export interface TiledPointCloudSource extends Tiles3dSource {
    name: string;
}

/**
 * Entity for displaying 3D-Tiles point clouds
 */
export default class TiledPointCloudEntity extends Tiles3dEntity {
    constructor(parameters: TiledPointCloudSource) {
        const material = new PointCloudMaterial({
            size: 2,
            mode: MODE.ELEVATION,
        });
        material.colorMap = getColorMap(config.pointcloud);

        super(parameters, {
            material,
        });
        this.name = `pointcloud-${parameters.name}`;
    }
}
