import { Color, DoubleSide, Mesh, MeshLambertMaterial } from 'three';
import { PLYLoader as PLYThreeLoader } from 'three/examples/jsm/loaders/PLYLoader';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import { type PickResult, type PickableFeatures } from '@giro3d/giro3d/core/picking';
import type Instance from '@giro3d/giro3d/core/Instance';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';

import Fetcher from '@/utils/Fetcher';
import { isObject } from '@/utils/Types';
import { Loader, type UrlParams } from './core/LoaderCore';

/** Parameters for creating PLY object */
export type PLYParameters = {
    at: Coordinates;
};

export type PLYImplParameters = PLYParameters & {
    featureProjection: string;
};

export interface PlyFeature {
    color: Color;
}

export class PlyMesh extends Mesh implements PickableFeatures<PlyFeature> {
    public readonly isPickableFeatures = true;
    public readonly isPlyMesh = true;

    pickFeaturesFrom(pickedResult: PickResult): PlyFeature[] {
        if (this.geometry.hasAttribute('color') && pickedResult.face) {
            const colors = this.geometry.getAttribute('color').array;
            const face = pickedResult.face;

            const color = new Color(
                colors[face.a * 3],
                colors[face.a * 3 + 1],
                colors[face.a * 3 + 2],
            );
            const result = [{ color }];
            pickedResult.features = result;
            return result;
        }

        return [];
    }

    static isPlyMesh = (obj: unknown): obj is PlyMesh =>
        isObject(obj) && (obj as PlyMesh).isPlyMesh;
    static isPlyPickResult = (obj: unknown): obj is PickResult<PlyFeature> =>
        isObject(obj) && PlyMesh.isPlyMesh((obj as PickResult<unknown>)?.object);
}

/**
 * Converts loaded data into a Entity3D
 *
 * @param data - Data to parse
 * @param parameters - Loader parameters
 * @returns PLY entity
 */
async function toEntity(data: ArrayBuffer, parameters: PLYImplParameters): Promise<Entity3D> {
    const position = parameters.at.as(parameters.featureProjection).toVector3();

    const loader = new PLYThreeLoader();
    const geometry = loader.parse(data);

    const material = new MeshLambertMaterial({
        side: DoubleSide,
    });
    if (geometry.hasAttribute('color')) {
        material.vertexColors = true;
    }
    geometry.computeVertexNormals();

    const mesh = new PlyMesh(geometry, material);
    mesh.name = 'plyModel';
    geometry.computeBoundingBox();

    mesh.position.copy(position);
    mesh.updateWorldMatrix(true, true);

    const entity = new Entity3D(mesh.uuid, mesh);
    return Promise.resolve(entity);
}

/**
 * PLY loader
 */
export const PLYLoaderImpl = {
    fetch: Fetcher.fetchArrayBuffer,
    toEntity,
};

/**
 * PLY loader
 */
export class PLYLoader extends Loader<PLYParameters, Entity3D> {
    async loadOne(
        instance: Instance,
        { url, ...parameters }: PLYParameters & UrlParams,
    ): Promise<Entity3D> {
        const data = await PLYLoaderImpl.fetch(url);
        const entity = await PLYLoaderImpl.toEntity(data, {
            ...parameters,
            featureProjection: instance.referenceCrs,
        });
        return entity;
    }
}
