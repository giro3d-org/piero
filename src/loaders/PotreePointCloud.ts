import type Instance from '@giro3d/giro3d/core/Instance';
import PotreePointCloud from '@giro3d/giro3d/entities/PotreePointCloud';
import { PotreeSource } from '@giro3d/giro3d/sources';

import { MathUtils } from 'three';
import LoaderCore from './core/LoaderCore';

/** Parameters for creating Tiled PointCloud object */
export type PotreePointCloudParameters = {
    /** URL to the directory file */
    urlBase: string;
    /**
     * Potree file
     * @defaultValue cloud.js
     */
    filename?: string;
};

/**
 * Potree point cloud loader
 */
export class PotreePointCloudLoader extends LoaderCore<
    PotreePointCloudParameters,
    PotreePointCloud
> {
    load(instance: Instance, parameters: PotreePointCloudParameters): Promise<PotreePointCloud> {
        const pointcloud = new PotreePointCloud(
            MathUtils.generateUUID(),
            new PotreeSource(parameters.urlBase, parameters.filename),
        );
        this._fillObject3DUserData(pointcloud, { filename: parameters.urlBase });
        return Promise.resolve(pointcloud);
    }
}
