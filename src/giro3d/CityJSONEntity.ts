import { Vector2 } from 'three';
import { CityJSONLoader, CityObjectsMesh } from 'cityjson-threejs-loader';
import { Entity3D } from '@giro3d/giro3d/entities';
import { PickOptions, PickResult, PickableFeatures } from '@giro3d/giro3d/core/picking';

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
    citymodel: any;
}

export interface CityJSONPickResult extends PickResult<CityJSONFeature> {
    entity: CityJSONEntity;
    object: CityObjectsMesh;
    features?: CityJSONFeature[];
}
export const isCityJSONPickResult = (obj: any): obj is CityJSONPickResult =>
    obj?.isCityJSONPickResult;

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
            isCityJSONPickResult: true,
        }));
    }

    pickFeaturesFrom(pickedResult: CityJSONPickResult): CityJSONFeature[] {
        const { object } = pickedResult;
        // @ts-ignore - resolveIntersectionInfo typing is broken
        const cityjsonInfo = object.resolveIntersectionInfo(
            pickedResult,
        ) as CityJSONIntersectionInfo;
        // @ts-ignore - CityObjectsMesh / cityjsonInfo don't have proper typing
        const citymodel = object.citymodel.CityObjects[cityjsonInfo.objectId];
        const result = [{ cityjsonInfo, citymodel }];
        pickedResult.features = result;
        return result;
    }

    static isCityJSONEntity = (obj: any): obj is CityJSONEntity => obj?.isCityJSONEntity;
}
