import { Color, DoubleSide, Mesh, MeshLambertMaterial } from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import Instance from '@giro3d/giro3d/core/Instance';
import { PickResult, PickableFeatures } from '@giro3d/giro3d/core/picking';
import { Entity3D } from '@giro3d/giro3d/entities';

/**
 * PLY options
 */
export type PLYOptions = {
    at: Coordinates;
}


export interface PlyFeature {
    color: Color
}

export class PlyMesh extends Mesh implements PickableFeatures<PlyFeature> {
    public readonly isPickableFeatures = true;
    public readonly isPlyMesh = true;

    pickFeaturesFrom(pickedResult: PickResult): PlyFeature[] {
        if (this.geometry.hasAttribute('color') && pickedResult.face) {
            const colors = this.geometry.getAttribute('color').array;
            const face = pickedResult.face;

            const color = new Color(colors[face.a * 3], colors[face.a * 3 + 1], colors[face.a * 3 + 2]);
            const result = [{ color }];
            pickedResult.features = result;
            return result;
        }

        return [];
    }

    static isPlyMesh = (obj: any): obj is PlyMesh => obj?.isPlyMesh;
    static isPlyPickResult = (obj: PickResult<any>): obj is PickResult<PlyFeature> => PlyMesh.isPlyMesh(obj?.object);
}

export default {
    /**
     * Loads a PLY file.
     *
     * @param instance Giro3d instance
     * @param id Layer id
     * @param file PLY file
     * @param options Options
     * @returns Entity created
     */
    async loadPly(instance: Instance, id: string, file: File | Response, options: PLYOptions) {
        const position = options.at.as(instance.referenceCrs).toVector3();

        const buffer = await file.arrayBuffer();
        const loader = new PLYLoader();
        const geometry = loader.parse(buffer);

        const material = new MeshLambertMaterial({
            side: DoubleSide,
        });
        if (geometry.hasAttribute("color")) {
            material.vertexColors = true;
        }
        geometry.computeVertexNormals()

        const mesh = new PlyMesh(geometry, material);
        mesh.name = 'plyModel';
        geometry.computeBoundingBox();

        mesh.position.copy(position);
        mesh.updateWorldMatrix(true, true);

        const entity = new Entity3D(mesh.uuid, mesh);
        mesh.traverse((obj) => {
            entity.onObjectCreated(obj);
        });
        return entity;
    },
};
