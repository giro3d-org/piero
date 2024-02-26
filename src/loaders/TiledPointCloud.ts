import { Material } from 'three';
import Instance from '@giro3d/giro3d/core/Instance';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial';

import PointCloudMaterial from '@/giro3d/PointCloudMaterial';

/** Parameters for creating Tiled PointCloud object */
export type TiledPointCloudParameters = {
    name: string;
};

export default {
    async load(
        instance: Instance,
        url: string,
        parameters: TiledPointCloudParameters,
    ): Promise<Tiles3D<Material>> {
        const pointcloud = new Tiles3D(`pointcloud-${parameters.name}`, new Tiles3DSource(url), {
            material: new PointCloudMaterial({
                size: 2,
                mode: MODE.ELEVATION,
            }),
        });
        return pointcloud;
    },
};
