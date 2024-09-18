import type Instance from '@giro3d/giro3d/core/Instance';
import Tiles3D from '@giro3d/giro3d/entities/Tiles3D';
import Tiles3DSource from '@giro3d/giro3d/sources/Tiles3DSource';
import PointCloudMaterial, { MODE } from '@giro3d/giro3d/renderer/PointCloudMaterial';

import config from '@/config';
import LoaderCore from './core/LoaderCore';
import type { TiledPointCloudDatasetConfig } from '@/types/configuration/datasets/tiledPointCloud';
import type { DatasetBase } from '@/types/Dataset';
import { getColorMap } from '@/utils/Configuration';

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
export class TiledPointCloudLoader extends LoaderCore<
    'pointcloud',
    TiledPointCloudDatasetConfig,
    Tiles3D
> {
    load(instance: Instance, dataset: DatasetBase<TiledPointCloudDatasetConfig>): Promise<Tiles3D> {
        const material = new PointCloudMaterial({
            size: 2,
            mode: MODE.ELEVATION,
        });
        material.colorMap = getColorMap(config.pointcloud);

        const pointcloud = new Tiles3D(new Tiles3DSource(dataset.config.source.url), {
            material,
        });
        pointcloud.name = `pointcloud-${dataset.name}`;
        this._fillObject3DUserData(pointcloud, { filename: dataset.config.source.url });
        return Promise.resolve(pointcloud);
    }
}
