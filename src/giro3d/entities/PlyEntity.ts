import { fillObject3DUserData } from '@/loaders/userData';
import Fetcher from '@/utils/Fetcher';
import { isObject } from '@/utils/Types';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import type PickableFeatures from '@giro3d/giro3d/core/picking/PickableFeatures';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import { Color, DoubleSide, Group, Mesh, MeshLambertMaterial } from 'three';
import { PLYLoader as PLYThreeLoader } from 'three/examples/jsm/loaders/PLYLoader';
import type { CoordinatesMixin, FeatureProjectionMixin, UrlOrDataMixin } from '../sources/mixins';

/** Parameters for creating {@link PlyEntity} */
export interface PlySource
    extends UrlOrDataMixin,
        Required<CoordinatesMixin>,
        Required<FeatureProjectionMixin> {}

/**
 * Feature returned when picking on Ply objects
 */
export interface PlyFeature {
    color: Color;
}

/**
 * PLY 3D object implementing our picking
 */
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
 * Entity for displaying a PLY file
 */
export default class PlyEntity extends Entity3D {
    readonly isPlyEntity = true;
    readonly source: PlySource;

    constructor(source: PlySource) {
        super(new Group());
        this.source = source;
    }

    protected async preprocess(): Promise<void> {
        const data = await Fetcher.fetchArrayBuffer(this.source.url);

        const position = this.source.at.as(this.source.featureProjection).toVector3();

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

        this.object3d.add(mesh);
        this.onObjectCreated(mesh);

        const context = Fetcher.getContext(this.source.url);
        fillObject3DUserData(this, { filename: context.filename });

        this.notifyChange(this.object3d);
    }
}
