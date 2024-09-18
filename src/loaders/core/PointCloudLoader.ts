import { BufferAttribute, BufferGeometry, Vector2, type TypedArray } from 'three';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import Instance from '@giro3d/giro3d/core/Instance';
import PointCloud from '@giro3d/giro3d/core/PointCloud';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import PointCloudMaterial, { MODE } from '@giro3d/giro3d/renderer/PointCloudMaterial';

import config from '@/config';
import Projections from '@/utils/Projections';
import { getColorMap } from '@/utils/Configuration';
import { DatasetConfig } from '@/types/configuration/datasets';
import { PointCloudDatasetConfig } from '@/types/configuration/datasets/core/pointcloud';
import { DatasetBase } from '@/types/Dataset';

export interface PointCloudLoaderImplParameters {
    dataProjection?: string;
    featureProjection: string;
}

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
    const material = new PointCloudMaterial({
        size: 2,
        mode: MODE.ELEVATION,
    });
    material.colorMap = getColorMap(config.pointcloud);
    const mypoints = new PointCloud({
        geometry,
        textureSize: new Vector2(0, 0), // Only used for coloring with a color layer
        material,
    });

    const entity = new Entity3D(mypoints);
    return entity;
}

function getImplParameters<TConfig extends DatasetConfig & PointCloudDatasetConfig<string>>(
    instance: Instance,
    parameters: TConfig,
    dataset: DatasetBase<TConfig>,
): PointCloudLoaderImplParameters {
    return {
        dataProjection: parameters.dataProjection ?? dataset.get('dataProjection'),
        featureProjection: instance.referenceCrs,
    };
}

/**
 * PointCloud loader
 */
export const PointCloudLoaderImpl = {
    toEntity,
    getImplParameters,
};
