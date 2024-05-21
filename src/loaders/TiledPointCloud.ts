import type Instance from '@giro3d/giro3d/core/Instance';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';
import { MODE } from '@giro3d/giro3d/renderer/PointCloudMaterial';

import PointCloudMaterial from '@/giro3d/PointCloudMaterial';
import LoaderCore from './core/LoaderCore';

/** Parameters for creating Tiled PointCloud object */
export type TiledPointCloudParameters = {
    /** URL to the tileset file */
    url: string;
    /** Name of the point cloud */
    name: string;
};

/**
 * Tiled point cloud loader
 */
export class TiledPointCloudLoader extends LoaderCore<TiledPointCloudParameters, Tiles3D> {
    load(instance: Instance, parameters: TiledPointCloudParameters): Promise<Tiles3D> {
        const pointcloud = new Tiles3D(
            `pointcloud-${parameters.name}`,
            new Tiles3DSource(parameters.url),
            {
                material: new PointCloudMaterial({
                    size: 2,
                    mode: MODE.ELEVATION,
                }),
            },
        );
        this._fillObject3DUserData(pointcloud, { filename: parameters.url });
        return Promise.resolve(pointcloud);
    }
}
