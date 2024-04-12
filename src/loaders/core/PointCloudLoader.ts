import { BufferAttribute, BufferGeometry, type TypedArray } from 'three';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import PointCloud from '@giro3d/giro3d/core/PointCloud';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import { MODE } from '@giro3d/giro3d/renderer/PointCloudMaterial';

import PointCloudMaterial from '@/giro3d/PointCloudMaterial';
import Projections from '@/utils/Projections';

/** Parameters for creating point clouds */
export type PointCloudLoaderParameters = {
    /** Projection of data */
    dataProjection?: string;
};

export type PointCloudLoaderImplParameters = PointCloudLoaderParameters & {
    featureProjection: string;
};

/**
 * Converts a flat array of points into a pointcloud.
 * Will handle reprojection if needed.
 *
 * @param data - Flat array of 3D points
 * @param parameters - Loader parameters
 * @returns PointCloud entity
 */
async function toEntity(
    data: TypedArray,
    parameters: PointCloudLoaderImplParameters,
): Promise<Entity3D> {
    if (parameters.dataProjection && parameters.dataProjection !== parameters.featureProjection) {
        const dataProjection = await Projections.loadProjCrsIfNeeded(parameters.dataProjection);

        const coords = new Coordinates(dataProjection, 0, 0);
        const coordsReference = new Coordinates(parameters.featureProjection, 0, 0, 0);
        for (let i = 0; i < data.length; i += 3) {
            coords.set(dataProjection, data[i + 0], data[i + 1], data[i + 2]);
            coords.as(parameters.featureProjection, coordsReference);
            data[i + 0] = coordsReference.values[0];
            data[i + 1] = coordsReference.values[1];
            data[i + 2] = coordsReference.values[2];
        }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(data, 3));
    const mypoints = new PointCloud({
        geometry,
        material: new PointCloudMaterial({
            size: 2,
            mode: MODE.ELEVATION,
        }),
    });

    const entity = new Entity3D(mypoints.uuid, mypoints);
    return entity;
}

/**
 * PointCloud loader
 */
export const PointCloudLoaderImpl = {
    toEntity,
};
