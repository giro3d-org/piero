import { DoubleSide, Mesh, MeshLambertMaterial, Vector3 } from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates.js';
import Instance from '@giro3d/giro3d/core/Instance';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';

/**
 * PLY options
 */
export type PLYOptions = {
    at: Coordinates;
}

export class PlyMesh extends Mesh {
    public readonly isPly = true;
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
        // @ts-ignore - target is actually optional
        const position = options.at.as(instance.referenceCrs).xyz(new Vector3());

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

        return new Entity3D(mesh.uuid, mesh);
    },
};
