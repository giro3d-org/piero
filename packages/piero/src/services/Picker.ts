import type Instance from '@giro3d/giro3d/core/Instance';
import type { PointsPickResult } from '@giro3d/giro3d/core/picking/PickPointsAt';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import type { VectorPickFeature } from '@giro3d/giro3d/core/picking/PickResult';
import type Entity from '@giro3d/giro3d/entities/Entity';
import type FeatureCollection from '@giro3d/giro3d/entities/FeatureCollection';
import type Giro3DMap from '@giro3d/giro3d/entities/Map';
import type { ShapePickResult } from '@giro3d/giro3d/entities/Shape';
import type { Vector2 } from 'three';

import { isPointsPickResult } from '@giro3d/giro3d/core/picking/PickPointsAt';
import { isMapPickResult } from '@giro3d/giro3d/core/picking/PickTilesAt';
import { isMap } from '@giro3d/giro3d/entities/Map';
import { isShapePickResult } from '@giro3d/giro3d/entities/Shape';
import { type Feature as OLFeature } from 'ol';
import { Box3, type Object3D, Vector3 } from 'three';

import type Annotation from '@/types/Annotation';
import type { PieroShapeUserData } from '@/types/Annotation';
import type { Attribute, AttributesGroups } from '@/types/Feature';

import Measure3D from '@/giro3d/Measure3D';
import { useAnalysisStore } from '@/stores/analysis';
import Feature from '@/types/Feature';

import { GRID_NAME, PLANE_NAME } from './LayerManager';

export type AttributeExtractorFn<T extends PickResult = PickResult> = (
    pickResult: T,
    attributesGroups: AttributesGroups,
) => void;

export const customAttributeExtractors: AttributeExtractorFn[] = [];

function comparePickResults(a: PickResult, b: PickResult): number {
    if (isShapePickResult(a)) {
        return -1;
    }
    if (isShapePickResult(b)) {
        return 1;
    }

    return a.distance - b.distance;
}

export default class Picker {
    private readonly _analysisStore = useAnalysisStore();

    public getFeatureFromPickedObject(pickedObject: PickResult): Feature | null {
        const { entity, features, object } = pickedObject;

        const object3d = entity?.object3d ?? object;
        let name = object3d.userData?.dataset?.name;
        const parent = entity?.id ?? object3d.uuid;

        const datasetAttributes: Array<Attribute> = [];
        const attributesGroups = new Map<string, Array<Attribute>>();
        attributesGroups.set('Dataset', datasetAttributes);

        if (entity) {
            if (isMapPickResult(pickedObject)) {
                if (features == null || features.length === 0) {
                    // Nothing picked, early exit
                    return null;
                }

                const feature = features.at(0) as VectorPickFeature;
                const featureName = this.getNameFromOLFeature(feature.feature);
                name = featureName ?? name;
                this.getAttributesFromOLFeature(feature.feature, attributesGroups);
                datasetAttributes.push({ key: 'Layer', value: feature.layer.name });
            } else if (isPointsPickResult(pickedObject)) {
                this.getAttributesFromPointCloud(pickedObject, attributesGroups);
            } else if ((entity as FeatureCollection).isFeatureCollection) {
                // do nothing, already covered by object?.userData
            } else if (isShapePickResult(pickedObject)) {
                const entity = pickedObject.entity;

                if (Measure3D.isMeasure3D(entity)) {
                    const measure = entity.userData.measure;
                    name = measure?.title ?? name;
                    this.getAttributesFromMeasure(pickedObject, attributesGroups);
                } else {
                    const annotation = entity.userData.annotation as Annotation;
                    name = annotation?.title ?? name;
                    this.getAttributesFromAnnotation(pickedObject, attributesGroups);
                }
            }

            for (const customExtractor of customAttributeExtractors) {
                customExtractor(pickedObject, attributesGroups);
            }
        }

        if (entity?.userData) {
            this.getAttributesFromEntity(entity, attributesGroups);
        }
        if (object?.userData != null) {
            this.getAttributesFromPickedObject3D(pickedObject, attributesGroups);
        }

        if (object != null) {
            this.getDatasetAttributes(object, datasetAttributes);
        }

        return new Feature(name, parent, attributesGroups, pickedObject.point);
    }

    public getFirstFeatureAt(
        instance: Instance,
        e: MouseEvent,
        radius = 1,
        filterOnObjects?: (obj: Entity | Object3D) => boolean,
    ): PickResult[] | null {
        const picked = this.getObjectsAt(instance, e, radius, filterOnObjects);
        if (picked != null && picked.length > 0) {
            return picked;
        }

        const pickedOnMap = this.getMapAt(instance, e, radius);
        if (pickedOnMap) {
            return [pickedOnMap];
        }

        return null;
    }

    public getGeometryAttributes(object: Object3D, attributes: Array<Attribute>): void {
        const bbox = new Box3();
        const size = new Vector3();
        const center = new Vector3();
        bbox.setFromObject(object);
        bbox.getCenter(center);
        bbox.getSize(size);

        attributes.push({
            key: 'Center',
            value: [center.x.toFixed(2), center.y.toFixed(2), center.z.toFixed(2)],
        });
        const unit = 'm';
        attributes.push({
            key: 'Size',
            value: [
                `${size.x.toFixed(2)}${unit}`,
                `${size.y.toFixed(2)}${unit}`,
                `${size.z.toFixed(2)}${unit}`,
            ],
        });
    }

    /**
     * Gets the point on map or grid where the user clicked.
     *
     * @param e - Mouse event
     * @param radius - Radius - the smaller, the faster and more precise (but
     * may return nothing)
     * @returns Result or null if nothing found
     */
    public getMapAt(instance: Instance, e: MouseEvent, radius = 1): PickResult | null {
        const where = instance.getObjects(o => (o as Giro3DMap).isMap);
        const picked = instance
            .pickObjectsAt(e, {
                limit: 1,
                pickFeatures: true,
                radius,
                sortByDistance: true,
                where,
            })
            .at(0);
        return picked ?? null;
    }

    public getMouseCoordinate(instance: Instance, mouse: Vector2): Vector3 | null {
        const where = instance.getObjects(o => (o as Giro3DMap).isMap);

        const picked = instance
            .pickObjectsAt(mouse, {
                limit: 1,
                radius: 0,
                where,
            })
            .at(0);
        return picked?.point ?? null;
    }

    /**
     * Gets the closest dataset object from where the user clicked.
     * Does **NOT** pick on the base map!
     *
     * @param e - Mouse event
     * @param radius - Radius - the smaller, the faster and more precise (but
     * may return nothing)
     * @returns Result or null if notthing found
     */
    public getObjectsAt(
        instance: Instance,
        e: MouseEvent | Vector2,
        radius = 1,
        filterOnObjects?: (obj: Entity | Object3D) => boolean,
    ): PickResult[] | null {
        let where = instance.getObjects(
            o =>
                isMap(o) !== true &&
                (o as Object3D).name !== PLANE_NAME &&
                (o as Object3D).name !== GRID_NAME,
        );
        if (filterOnObjects) {
            where = where.filter(filterOnObjects);
        }

        const picked = instance.pickObjectsAt(e, {
            filter: res => this.filterPick(instance, res),
            pickFeatures: true,
            radius,
            where,
        });

        picked.sort(comparePickResults);

        return picked ?? null;
    }

    public hasFeature(instance: Instance, mouse: Vector2): boolean {
        const where = instance.getObjects(
            o =>
                (o as Giro3DMap).isMap !== true &&
                (o as Object3D).name !== PLANE_NAME &&
                (o as Object3D).name !== GRID_NAME,
        );

        const picked = instance
            .pickObjectsAt(mouse, {
                limit: 1,
                radius: 0,
                where,
            })
            .at(0);
        return picked != null;
    }

    public pick(
        instance: Instance,
        event: MouseEvent,
    ): { feature: Feature | null; pickResult: PickResult; point: Vector3 } | null {
        const picked = this.getFirstFeatureAt(instance, event)?.at(0);
        if (picked) {
            const feature = this.getFeatureFromPickedObject(picked);
            if (feature) {
                return { feature, pickResult: picked, point: picked.point };
            }
        }
        return null;
    }

    protected filterPick(instance: Instance, result: PickResult): boolean {
        if (this._analysisStore.isClippingBoxEnabled()) {
            const containsPoint = this._analysisStore.getClippingBox().containsPoint(result.point);
            if (this._analysisStore.isClippingBoxInverted()) {
                if (containsPoint) {
                    return false;
                }
            } else {
                if (!containsPoint) {
                    return false;
                }
            }
        }
        if (
            result.distance < instance.view.camera.near ||
            result.distance > instance.view.camera.far
        ) {
            return false;
        }

        return true;
    }

    protected getAttributesFromAnnotation(
        pickResult: ShapePickResult,
        attributesGroups: AttributesGroups,
    ): void {
        if (!attributesGroups.has('GeoJSON')) {
            attributesGroups.set('GeoJSON', []);
        }

        const attributesGeoJSON = attributesGroups.get('GeoJSON') as Attribute[];

        const shape = pickResult.entity;
        const userData = shape.userData as PieroShapeUserData;
        const { annotation, measurements, type } = userData;

        if (annotation != null) {
            for (const [key, value] of Object.entries(annotation.properties)) {
                if (
                    key === 'geometry' ||
                    key === 'geometryProperty' ||
                    key === 'metadata' ||
                    key === 'entity'
                ) {
                    continue;
                }
                attributesGeoJSON.push({ key, value });
            }
        }

        if (!attributesGroups.has('Measurement')) {
            attributesGroups.set('Measurement', []);
        }
        const attributes = attributesGroups.get('Measurement') as Attribute[];

        if (type === 'MultiPoint') {
            attributes.push({ key: 'Number of points', value: shape.points.length });
        }

        const unit = 'm';
        if (measurements.area != null) {
            attributes.push({ key: 'Area', value: `${measurements.area.toFixed(2)}${unit}²` });
        }
        if (measurements.perimeter != null) {
            attributes.push({
                key: type === 'Polygon' ? 'Perimeter' : 'Length',
                value: `${measurements.perimeter.toFixed(2)}${unit}`,
            });
        }
        if (measurements.minmax != null) {
            attributes.push({
                key: 'Min altitude',
                value: `${measurements.minmax[0].toFixed(2)}${unit}`,
            });
            attributes.push({
                key: 'Max altitude',
                value: `${measurements.minmax[1].toFixed(2)}${unit}`,
            });
        }
    }

    protected getAttributesFromEntity(entity: Entity, attributesGroups: AttributesGroups): void {
        if (!attributesGroups.has('Feature')) {
            attributesGroups.set('Feature', []);
        }
        const attributes = attributesGroups.get('Feature') as Attribute[];

        if (entity?.userData != null) {
            this.getAttributesFromUserData(entity.userData, attributes);
        }
    }

    protected getAttributesFromMeasure(
        pickResult: PickResult,
        attributesGroups: AttributesGroups,
    ): void {
        if (!attributesGroups.has('GeoJSON')) {
            attributesGroups.set('GeoJSON', []);
        }
        const attributesGeoJSON = attributesGroups.get('GeoJSON') as Attribute[];

        const parent = pickResult.entity as Measure3D;

        for (const [key, value] of Object.entries(parent.userData.measure.properties)) {
            if (
                key === 'geometry' ||
                key === 'geometryProperty' ||
                key === 'metadata' ||
                key === 'entity'
            ) {
                continue;
            }
            attributesGeoJSON.push({ key, value });
        }

        if (!attributesGroups.has('Measurement')) {
            attributesGroups.set('Measurement', []);
        }
        const attributes = attributesGroups.get('Measurement') as Attribute[];
        attributes.push({ key: 'From', value: parent.from });
        attributes.push({ key: 'To', value: parent.to });
        attributes.push({ key: 'Length', value: `${parent.length.toFixed(2)}m` });
    }

    protected getAttributesFromObject3D(object: Object3D, attributes: Attribute[]): void {
        if (object?.userData != null) {
            this.getAttributesFromUserData(object.userData, attributes);
        }

        if (object?.parent) {
            if ('isFeatureTile' in object.parent && object.parent.isFeatureTile === true) {
                // Don't go too far with FeatureCollections
                return;
            }
            this.getAttributesFromObject3D(object.parent, attributes);
        }
    }

    protected getAttributesFromOLFeature(
        feature: OLFeature,
        attributesGroups: AttributesGroups,
    ): void {
        if (!attributesGroups.has('Feature')) {
            attributesGroups.set('Feature', []);
        }
        const attributes = attributesGroups.get('Feature') as Attribute[];

        if (feature.getId() !== undefined) {
            attributes.push({ key: 'fid', value: feature.getId() });
        }
        for (const [key, value] of Object.entries(feature.getProperties())) {
            if (key === 'geometry' || key === 'geometryProperty') {
                continue;
            }
            attributes.push({ key, value });
        }
    }

    protected getAttributesFromPickedObject3D(
        pickResult: PickResult,
        attributesGroups: AttributesGroups,
    ): void {
        if (!attributesGroups.has('Feature')) {
            attributesGroups.set('Feature', []);
        }
        const attributes = attributesGroups.get('Feature') as Attribute[];

        this.getAttributesFromObject3D(pickResult.object, attributes);
    }

    protected getAttributesFromPointCloud(
        pickResult: PointsPickResult,
        attributesGroups: AttributesGroups,
    ): void {
        attributesGroups.get('Dataset')?.push({ key: 'Tile', value: pickResult.object.name });
    }

    protected getAttributesFromUserData(userData: object, attributes: Attribute[]): void {
        for (const [key, value] of Object.entries(userData)) {
            if (
                key === 'geometry' ||
                key === 'geometryProperty' ||
                key === 'metadata' ||
                key === 'entity' ||
                key === 'dataset' ||
                key === 'bbox' ||
                key === 'hover'
            ) {
                continue;
            }

            if (key === 'feature' && typeof value === 'object' && 'ol_uid' in value) {
                // OpenLayers feature
                this.getAttributesFromUserData(value.getProperties(), attributes);
                continue;
            }

            if (key === 'properties') {
                this.getAttributesFromUserData(value, attributes);
                continue;
            }
            if (typeof value === 'object') {
                continue;
            }

            if (key === 'id') {
                attributes.push({ key: 'fid', value });
                continue;
            }
            attributes.push({ key, value });
        }
    }

    protected getDatasetAttributes(object: Object3D, datasetAttributes: Attribute[]): void {
        if (object?.userData?.dataset?.name != null) {
            datasetAttributes.push({ key: 'Dataset', value: object.userData.dataset.name });
        }
        if (object?.userData?.dataset?.filename != null) {
            datasetAttributes.push({ key: 'File', value: object.userData.dataset.filename });
        }
        if (object.parent) {
            this.getDatasetAttributes(object.parent, datasetAttributes);
        }
    }

    protected getNameFromOLFeature(feature: OLFeature): string {
        return feature.get('nom') ?? feature.get('name') ?? feature.getId();
    }
}
