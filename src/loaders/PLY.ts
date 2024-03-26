import { Color, DoubleSide, Mesh, MeshLambertMaterial } from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Instance from '@giro3d/giro3d/core/Instance';
import { PickResult, PickableFeatures } from '@giro3d/giro3d/core/picking';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';

import Fetcher, { UrlOrBlob } from '@/utils/Fetcher';
import { isObject } from '@/utils/Types';
import loader from './loader';

/** Parameters for creating PLY object */
export type PLYParameters = {
    at: Coordinates;
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

export default {
    async load(
        instance: Instance,
        url: UrlOrBlob | ArrayBuffer,
        parameters: PLYParameters,
    ): Promise<Entity3D> {
        const data = await Fetcher.arrayBuffer(url);
        const entity = await this.loadArrayBuffer(instance, data, parameters);
        loader.fillOrigin(entity.object3d, url);
        return entity;
    },

    async loadArrayBuffer(
        instance: Instance,
        data: ArrayBuffer,
        parameters: PLYParameters,
    ): Promise<Entity3D> {
        const position = parameters.at.as(instance.referenceCrs).toVector3();

        const loader = new PLYLoader();
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
        entity.onObjectCreated(mesh);
        return entity;
    },
};
