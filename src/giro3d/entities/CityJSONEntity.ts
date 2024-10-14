import { fillObject3DUserData } from '@/loaders/userData';
import Fetcher from '@/utils/Fetcher';
import Projections from '@/utils/Projections';
import { isObject } from '@/utils/Types';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import type PickOptions from '@giro3d/giro3d/core/picking/PickOptions';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import type PickableFeatures from '@giro3d/giro3d/core/picking/PickableFeatures';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type { CityObjectsMesh } from 'cityjson-threejs-loader';
import {
    CityJSONLoader as CityJSONThreeLoader,
    CityJSONWorkerParser,
} from 'cityjson-threejs-loader';
import type { Vector2 } from 'three';
import { Group } from 'three';
import type {
    DataProjectionMixin,
    FeatureProjectionMixin,
    UrlOrDataMixin,
} from '../sources/mixins';

/**
 * Object returned by CityJSON's `resolveIntersectionInfo`, used when picking
 */
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

/**
 * Feature returned when picking on CityJSON objects
 */
export interface CityJSONFeature {
    /** Intersection info from CityJSON library */
    cityjsonInfo: CityJSONIntersectionInfo;
    /** CityJSON object picked */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    citymodel: any;
}

/**
 * Pick result on {@link CityJSONEntity | CityJSON entities}
 */
export interface CityJSONPickResult extends PickResult<CityJSONFeature> {
    isCityJSONPickResult: true;
    entity: CityJSONEntity;
    object: CityObjectsMesh;
    features?: CityJSONFeature[];
}
export const isCityJSONPickResult = (obj: unknown): obj is CityJSONPickResult =>
    isObject(obj) && (obj as CityJSONPickResult).isCityJSONPickResult;

/**
 * Source interface for {@link CityJSONEntity}
 */
export interface CityJSONSource
    extends UrlOrDataMixin,
        DataProjectionMixin,
        Required<FeatureProjectionMixin> {}

/**
 * Entity for displaying a CityJSON file
 */
export default class CityJSONEntity
    extends Entity3D
    implements PickableFeatures<CityJSONFeature, CityJSONPickResult>
{
    readonly isCityJSONEntity = true;
    readonly isPickableFeatures = true;
    readonly source: CityJSONSource;

    constructor(source: CityJSONSource) {
        super(new Group());
        this.source = source;
    }

    async preprocess(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json: any = await Fetcher.fetchJson(this.source.url);

        return new Promise<void>(resolve => {
            const parser = new CityJSONWorkerParser();
            const loader = new CityJSONThreeLoader(parser);

            parser.chunkSize = 2000;
            parser.onComplete = async () => {
                // FIXME: here's a code smell indicating we are not using CityJSON correctly
                let z = 0;
                if (
                    json.transform?.translate?.at(2) != null &&
                    json.transform?.translate.at(2) !== 0
                ) {
                    // Z already taken into account when creating mesh
                    z = 0;
                } else if (json.vertices?.at(0)?.at(2) !== 0) {
                    // Z already taken into account in the vertices
                    z = 0;
                } else if (json.metadata?.geographicalExtent?.at(5) != null) {
                    // We have to take Z into account - FIXME
                    z =
                        json.metadata?.geographicalExtent[5] -
                        json.CityObjects?.['1']?.attributes?.[
                            'ArrDissolve-LoD12.global_elevation_max'
                        ]
                            ? json.CityObjects?.['1']?.attributes?.[
                                  'ArrDissolve-LoD12.global_elevation_max'
                              ]
                            : 0;
                }

                const m = loader.matrix.toArray();
                const projection =
                    json?.metadata?.referenceSystem ??
                    this.source.dataProjection ??
                    this.source.featureProjection;

                const proj = await Projections.loadProjCrsIfNeeded(projection);
                if (proj) {
                    const coords = new Coordinates(proj, -m[12], -m[13], z);
                    const coordsReference = coords.as(this.source.featureProjection);
                    loader.scene.position.set(
                        coordsReference.values[0],
                        coordsReference.values[1],
                        coordsReference.values[2],
                    );
                } else {
                    loader.scene.position.set(-m[12], -m[13], z);
                }
                loader.scene.updateMatrix();
                loader.scene.updateMatrixWorld(true);

                this.object3d.add(loader.scene);
                this.onObjectCreated(loader.scene);

                const context = Fetcher.getContext(this.source.url);
                fillObject3DUserData(this, { filename: context.filename });

                this.notifyChange(this.object3d);
                resolve();
            };

            loader.load(json);
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
        isObject(obj) && (obj as CityJSONEntity).isCityJSONEntity;
}
