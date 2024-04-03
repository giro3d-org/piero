import { Vector2 } from 'three';
import { CityJSONLoader, CityObjectsMesh } from 'cityjson-threejs-loader';
import { Entity3D } from '@giro3d/giro3d/entities';
import { PickOptions, PickResult, PickableFeatures } from '@giro3d/giro3d/core/picking';
import { isObject } from '@/utils/Types';

export interface CityJSONIntersectionInfo {
    vertexId: number;
    objectIndex: number;
    objectId: string;
    geometryIndex: number;
    boundaryIndex: number;
    objectTypeIndex: number;
    surfaceTypeIndex: number;
    lodIndex: number;
}

export interface CityJSONFeature {
    cityjsonInfo: CityJSONIntersectionInfo;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    citymodel: any;
}

export interface CityJSONPickResult extends PickResult<CityJSONFeature> {
    isCityJSONPickResult: true;
    entity: CityJSONEntity;
    object: CityObjectsMesh;
    features?: CityJSONFeature[];
}
export const isCityJSONPickResult = (obj: unknown): obj is CityJSONPickResult =>
    isObject(obj) && (obj as CityJSONPickResult).isCityJSONPickResult;

export default class CityJSONEntity
    extends Entity3D
    implements PickableFeatures<CityJSONFeature, CityJSONPickResult>
{
    readonly isCityJSONEntity = true;
    readonly isPickableFeatures = true;

    constructor(loader: CityJSONLoader) {
        super(loader.scene.uuid, loader.scene);

        this.object3d.traverse(obj => {
            this.onObjectCreated(obj);
        });
    }

    pick(canvasCoords: Vector2, options?: PickOptions): CityJSONPickResult[] {
        return super.pick(canvasCoords, options).map(p => ({
            ...p,
            entity: this,
            object: p.object as CityObjectsMesh,
            features: p.features as CityJSONFeature[] | undefined,
            isCityJSONPickResult: true,
        }));
    }

    pickFeaturesFrom(pickedResult: CityJSONPickResult): CityJSONFeature[] {
        const { object } = pickedResult;
        // @ts-expect-error - resolveIntersectionInfo typing is broken
        const cityjsonInfo = object.resolveIntersectionInfo(
            pickedResult,
        ) as CityJSONIntersectionInfo;
        // @ts-expect-error - CityObjectsMesh / cityjsonInfo don't have proper typing
        const citymodel = object.citymodel.CityObjects[cityjsonInfo.objectId];
        const result = [{ cityjsonInfo, citymodel }];
        pickedResult.features = result;
        return result;
    }

    static isCityJSONEntity = (obj: object): obj is CityJSONEntity =>
        obj && (obj as CityJSONEntity).isCityJSONEntity;
}
