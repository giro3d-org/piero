import { BufferAttribute, BufferGeometry, type TypedArray } from 'three';
import type Instance from '@giro3d/giro3d/core/Instance';
import PointCloud from '@giro3d/giro3d/core/PointCloud';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import { MODE } from '@giro3d/giro3d/renderer/PointsMaterial';

import PointCloudMaterial from '@/giro3d/PointCloudMaterial';
import Projections from '@/utils/Projections';

export interface PointCloudParameters {
    projection?: string;
}

export default {
    async loadArray(
        instance: Instance,
        positions: TypedArray,
        parameters: PointCloudParameters = {},
    ): Promise<Entity3D> {
        if (parameters.projection && parameters.projection !== instance.referenceCrs) {
            const dataProjection = await Projections.loadProjCrsIfNeeded(parameters.projection);

            const coords = new Coordinates(dataProjection, 0, 0);
            const coordsReference = new Coordinates(instance.referenceCrs, 0, 0, 0);
            for (let i = 0; i < positions.length; i += 3) {
                coords.set(dataProjection, positions[i + 0], positions[i + 1], positions[i + 2]);
                coords.as(instance.referenceCrs, coordsReference);
                positions[i + 0] = coordsReference.values[0];
                positions[i + 1] = coordsReference.values[1];
                positions[i + 2] = coordsReference.values[2];
            }
        }
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        const mypoints = new PointCloud({
            geometry,
            material: new PointCloudMaterial({
                size: 2,
                mode: MODE.ELEVATION,
            }),
        });

        const entity = new Entity3D(mypoints.uuid, mypoints);
        entity.onObjectCreated(mypoints);
        return entity;
    },
};
