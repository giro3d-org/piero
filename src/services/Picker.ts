import { Box3, Object3D, Vector3 } from "three";
import { Feature as OLFeature } from "ol";
import { IfcCategoryMap } from 'openbim-components';
import Instance from "@giro3d/giro3d/core/Instance";
import { PickResult, PointsPickResult, isMapPickResult, isPointsPickResult } from "@giro3d/giro3d/core/picking";
import Entity from "@giro3d/giro3d/entities/Entity";
import { DrawingPickResult, isDrawingPickResult } from "@giro3d/giro3d/entities/DrawingCollection";
import Annotation from "@/types/Annotation";
import Feature, { Attribute, AttributesGroups } from "@/types/Feature";
import { CityJSONPickResult, isCityJSONPickResult } from "@/giro3d/CityJSONEntity";
import { IFCPickResult, isIFCPickResult } from "@/giro3d/IfcEntity";
import { PlyMesh } from "@/loaders/PLY";
import { useAnalysisStore } from "@/stores/analysis";

export default class Picker {
    private readonly analysisStore = useAnalysisStore();

    filterPick(instance: Instance, result: PickResult): boolean {
        if (this.analysisStore.isClippingBoxEnabled()) {
            const containsPoint = this.analysisStore.getClippingBox().containsPoint(result.point);
            if (this.analysisStore.isClippingBoxInverted()) {
                if (containsPoint) return false;
            } else {
                if (!containsPoint) return false;
            }
        }
        if (result.distance < instance.camera.camera3D.near
            || result.distance > instance.camera.camera3D.far) {
                return false;
        }

        return true;
    }

    getNameFromOLFeature(feature: OLFeature): string {
        return feature.get('nom')
            ?? feature.get('name')
            ?? feature.getId();
    }

    getAttributesFromOLFeature(feature: OLFeature, attributesGroups: AttributesGroups) {
        if (!attributesGroups.has("Feature")) {
            attributesGroups.set("Feature", []);
        }
        const attributes = attributesGroups.get("Feature") as Attribute[];

        if (feature.getId() !== undefined) {
            attributes.push({ key: 'fid', value: feature.getId() });
        }
        for (const [key, value] of Object.entries(feature.getProperties())) {
            if (key === 'geometry' || key === 'geometryProperty') continue;
            attributes.push({ key, value });
        }
    }

    getAttributesFromPointCloud(pickResult: PointsPickResult, attributesGroups: AttributesGroups) {
        attributesGroups.get("Dataset")?.push({ key: 'Tile', value: pickResult.object.name });
    }

    getAttributesFromCityObject(pickResult: CityJSONPickResult, attributesGroups: AttributesGroups) {
        const feature = pickResult.features?.at(0);
        if (!feature) return;

        if (!attributesGroups.has("CityJSON")) {
            attributesGroups.set("CityJSON", []);
        }
        const cityjsonAttributes = attributesGroups.get("CityJSON") as Attribute[];

        const { cityjsonInfo, citymodel } = feature;

        cityjsonAttributes.push({ key: 'ID', value: cityjsonInfo.objectId });
        cityjsonAttributes.push({ key: 'Type', value: citymodel.type });

        const geometry = citymodel.geometry[cityjsonInfo.geometryIndex];
        cityjsonAttributes.push({ key: 'LoD', value: geometry.lod });

        const surface = geometry.semantics?.surfaces[cityjsonInfo.surfaceTypeIndex];
        if (surface) {
            cityjsonAttributes.push({ key: 'Surface type', value: surface.type });
        }
    }

    getAttributesFromPlyObject(pickResult: PickResult, attributesGroups: AttributesGroups) {
        const feature = pickResult.features?.at(0);
        if (!feature) return;

        if (!attributesGroups.has("PLY")) {
            attributesGroups.set("PLY", []);
        }
        const plyAttributes = attributesGroups.get("PLY") as Attribute[];

        plyAttributes.push({ key: 'Color', value: feature.color });
    }

    getAttributesFromUserData(userData: any, attributes: Attribute[]) {
        for (const [key, value] of Object.entries(userData)) {
            if (key === 'geometry' || key === 'geometryProperty' || key === 'metadata' || key === 'entity' || key === 'bbox') continue;
            if (key === 'properties') {
                this.getAttributesFromUserData(value, attributes);
                continue;
            }
            if (typeof value === 'object') continue;

            if (key === 'id') {
                attributes.push({ key: 'fid', value });
                continue;
            }
            attributes.push({ key, value });
        }
    }

    getAttributesFromObject3D(pickResult: PickResult, attributesGroups: AttributesGroups) {
        if (!attributesGroups.has("Feature")) {
            attributesGroups.set("Feature", []);
        }
        const attributes = attributesGroups.get("Feature") as Attribute[];

        const { object } = pickResult;
        if (object?.userData) {
            this.getAttributesFromUserData(object.userData, attributes);
        }
    }

    getAttributesFromIfc(pickResult: IFCPickResult, attributesGroups: AttributesGroups) {
        const feature = pickResult.features?.at(0);
        if (!feature) return;

        if (!attributesGroups.has("IFC")) {
            attributesGroups.set("IFC", []);
        }
        const attributes = attributesGroups.get("IFC") as Attribute[];

        const { itemProperties, ifcProperties } = feature;

        const nullValue = 'NULL';
        const name = itemProperties.Name?.value ?? nullValue;

        attributes.push({ key: 'Site', value: pickResult.entity.object3d.userData?.dataset?.name ?? nullValue });
        attributes.push({ key: 'IFCType', value: IfcCategoryMap[itemProperties.type] ?? nullValue });
        attributes.push({ key: 'Name', value: name });
        attributes.push({ key: 'ID', value: itemProperties.expressID });
        attributes.push({ key: 'GlobalId', value: itemProperties.GlobalId?.value ?? nullValue });
        if (itemProperties.Description?.value) attributes.push({ key: 'Description', value: itemProperties.Description.value });
        if (itemProperties.PredefinedType?.value) attributes.push({ key: 'PredefinedType', value: itemProperties.PredefinedType.value });
        if (itemProperties.ObjectType?.value) attributes.push({ key: 'ObjectType', value: itemProperties.ObjectType.value });

        for (const { parentName, name, value } of ifcProperties) {
            if (!attributesGroups.has(parentName)) {
                attributesGroups.set(parentName, []);
            }
            attributesGroups.get(parentName)?.push({ key: name, value });
        }
    }

    /**
     * Gets the closest dataset object from where the user clicked.
     * Does **NOT** pick on the base map!
     *
     * @param e Mouse event
     * @param radius Radius - the smaller, the faster and more precise (but
     * may return nothing)
     * @returns Result or null if notthing found
     */
    getObjectAt(instance: Instance, e: MouseEvent, radius = 1, filterOnObjects?: (obj: Object3D | Entity) => boolean): PickResult | null {
        let where = instance.getObjects(o => (o as any).isMap !== true && (o as any).name !== 'plane' && (o as any).name !== 'grid');
        if (filterOnObjects) where = where.filter(filterOnObjects);

        const picked = instance.pickObjectsAt(e, {
            radius,
            where,
            sortByDistance: true,
            limit: 1,
            pickFeatures: true,
            filter: res => this.filterPick(instance, res),
        }).at(0);
        return picked ?? null;
    }

    /**
     * Gets the point on map or grid where the user clicked.
     *
     * @param e Mouse event
     * @param radius Radius - the smaller, the faster and more precise (but
     * may return nothing)
     * @returns Result or null if nothing found
     */
    getMapAt(instance: Instance, e: MouseEvent, radius = 1): PickResult | null {
        const where = instance.getObjects(o => (o as any).isMap);
        const picked = instance.pickObjectsAt(e, {
            radius,
            limit: 1,
            where,
            sortByDistance: true,
            pickFeatures: true,
        }).at(0);
        return picked ?? null;
    }

    getFirstFeatureAt(instance: Instance, e: MouseEvent, radius = 1, filterOnObjects?: (obj: Object3D | Entity) => boolean): PickResult | null {
        const picked = this.getObjectAt(instance, e, radius, filterOnObjects);
        if (picked) {
            return picked;
        }

        const pickedOnMap = this.getMapAt(instance, e, radius);
        if (pickedOnMap) {
            return pickedOnMap;
        }

        return null;
    }

    getGeometryAttributes(object: Object3D, attributes: Array<Attribute>) {
        const bbox = new Box3();
        const size = new Vector3();
        const center = new Vector3();
        bbox.setFromObject(object);
        bbox.getCenter(center);
        bbox.getSize(size);

        attributes.push({
            key: 'Center',
            value: [
                center.x.toFixed(2),
                center.y.toFixed(2),
                center.z.toFixed(2),
            ],
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

    getAttributesFromDrawing(pickResult: DrawingPickResult, attributesGroups: AttributesGroups) {
        if (!attributesGroups.has("GeoJSON")) {
            attributesGroups.set("GeoJSON", []);
        }
        const attributesGeoJSON = attributesGroups.get("GeoJSON") as Attribute[];

        for (const [key, value] of Object.entries(pickResult.drawing.userData.annotation.properties)) {
            if (key === 'geometry' || key === 'geometryProperty' || key === 'metadata' || key === 'entity') continue;
            attributesGeoJSON.push({ key, value });
        }

        const measurements = pickResult.drawing.userData.measurements;
        if (measurements) {
            if (!attributesGroups.has("Measurement")) {
                attributesGroups.set("Measurement", []);
            }
            const attributes = attributesGroups.get("Measurement") as Attribute[];

            if (pickResult.drawing.geometryType === 'MultiPoint') {
                attributes.push({ key: 'Number of points', value: measurements.nbPoints });
            }

            const unit = 'm';
            if (measurements.area) {
                attributes.push({ key: 'Area', value: `${measurements.area.toFixed(2)}${unit}²` });
            }
            if (measurements.perimeter) {
                attributes.push({ key: 'Perimeter', value: `${measurements.perimeter.toFixed(2)}${unit}` });
            }
            if (measurements.minmax) {
                attributes.push({ key: 'Min altitude', value: `${measurements.minmax[0].toFixed(2)}${unit}` });
                attributes.push({ key: 'Max altitude', value: `${measurements.minmax[1].toFixed(2)}${unit}` });
            }
        }
    }

    getFeatureFromPickedObject(pickedObject: PickResult): Feature | null {
        const { entity, object, features } = pickedObject;

        const object3d = entity?.object3d ?? object;
        let name = object3d.userData?.dataset?.name;
        const parent = entity?.id ?? object3d.uuid;

        const datasetAttributes: Array<Attribute> = [];
        const attributesGroups = new Map<string, Array<Attribute>>();
        attributesGroups.set("Dataset", datasetAttributes);

        if (entity) {
            if (isMapPickResult(pickedObject)) {
                if (features == null || features.length === 0) {
                    // Nothing picked, early exit
                    return null;
                }

                const feature = features.at(0);
                const featureName = this.getNameFromOLFeature(feature.feature);
                name = featureName ?? name;
                this.getAttributesFromOLFeature(feature.feature, attributesGroups);
                datasetAttributes.push({ key: 'Layer', value: feature.layer.name });
            } else if (isIFCPickResult(pickedObject)) {
                this.getAttributesFromIfc(pickedObject, attributesGroups);
            } else if (isCityJSONPickResult(pickedObject)) {
                this.getAttributesFromCityObject(pickedObject, attributesGroups);
            } else if (isPointsPickResult(pickedObject)) {
                this.getAttributesFromPointCloud(pickedObject, attributesGroups);
            } else if ((entity as any).isFeatureCollection) {
                this.getAttributesFromObject3D(pickedObject, attributesGroups);
            } else if (isDrawingPickResult(pickedObject)) {
                const annotation = pickedObject.drawing.userData?.annotation as Annotation;
                name = annotation?.title ?? name;
                this.getAttributesFromDrawing(pickedObject, attributesGroups);
            } else if (object?.userData) {
                this.getAttributesFromObject3D(pickedObject, attributesGroups);
            }
        } else if (PlyMesh.isPlyPickResult(pickedObject)) {
            this.getAttributesFromPlyObject(pickedObject, attributesGroups);
        } else if (object?.userData) {
            this.getAttributesFromObject3D(pickedObject, attributesGroups);
        }

        if ((entity as any)?.filename) {
            datasetAttributes.push({ key: 'Dataset', value: (entity as any).filename });
        }

        return new Feature(name, parent, attributesGroups, pickedObject.point);
    }

    getMouseCoordinate(instance: Instance, event: MouseEvent): Vector3 | null {
        const where = instance.getObjects(o => (o as any).isMap);

        const picked = instance.pickObjectsAt(event, {
            radius: 0,
            limit: 1,
            where,
        }).at(0);
        return picked?.point ?? null;
    }

    hasFeature(instance: Instance, event: MouseEvent): boolean {
        const where = instance.getObjects(o => (o as any).isMap !== true && (o as any).name !== 'plane' && (o as any).name !== 'grid');

        const picked = instance.pickObjectsAt(event, {
            radius: 0,
            limit: 1,
            where,
        }).at(0);
        return picked != null;
    }

    pick(instance: Instance, event: MouseEvent): { point: Vector3, feature: Feature | null, pickResult: PickResult } | null {
        const picked = this.getFirstFeatureAt(instance, event);
        if (picked) {
            const feature = this.getFeatureFromPickedObject(picked);
            if (feature) {
                return { feature, point: picked.point, pickResult: picked };
            }
        }
        return null;
    }
}
