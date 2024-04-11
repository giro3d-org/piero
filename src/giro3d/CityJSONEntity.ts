import { type Vector2 } from 'three';
import { type CityJSONLoader, type CityObjectsMesh } from 'cityjson-threejs-loader';
import { Entity3D } from '@giro3d/giro3d/entities';
import type { PickOptions, PickResult, PickableFeatures } from '@giro3d/giro3d/core/picking';
import { isObject } from '@/utils/Types';
import type {
    CompositeSolid,
    CompositeSurface,
    GeometryInstance,
    MultiLineString,
    MultiPoint,
    MultiSolid,
    MultiSurface,
    Solid,
    _AbstractCityObject as _AbstractCityObjectV201,
} from '@giro3d/cityjson-schemas-typescript/CityJSONV2_0_1';

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

export type CityModel = _AbstractCityObjectV201 & {
    geometry?: (
        | CompositeSolid
        | CompositeSurface
        | GeometryInstance
        | MultiLineString
        | MultiPoint
        | MultiSolid
        | MultiSurface
        | Solid
    )[];
};

export interface CityJSONFeature {
    cityjsonInfo: CityJSONIntersectionInfo;
    citymodel: CityModel;
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
        // @ts-expect-error - resolveIntersectionInfo typing is broken (https://github.com/cityjson/cityjson-threejs-loader/pull/10)
        const cityjsonInfo = object.resolveIntersectionInfo(
            pickedResult,
        ) as CityJSONIntersectionInfo;
        // @ts-expect-error - CityObjectsMesh / cityjsonInfo don't have proper typing (https://github.com/cityjson/cityjson-threejs-loader/pull/11)
        const citymodel = object.citymodel.CityObjects[cityjsonInfo.objectId];
        const result = [{ cityjsonInfo, citymodel }];
        pickedResult.features = result;
        return result;
    }

    static isCityJSONEntity = (obj: object): obj is CityJSONEntity =>
        obj && (obj as CityJSONEntity).isCityJSONEntity;
}
