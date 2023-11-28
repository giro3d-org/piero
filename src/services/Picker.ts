import { Box3, Object3D, Vector3 } from "three";
import { Fragment } from "bim-fragment/fragment";
import { IfcCategoryMap } from 'openbim-components';
import Instance from "@giro3d/giro3d/core/Instance";
import Drawing from "@giro3d/giro3d/interactions/Drawing";
import Entity3D from "@giro3d/giro3d/entities/Entity3D";
import { Feature as OLFeature } from "ol";
import Feature, { Attribute, AttributesGroups } from "@/types/Feature";
import Measure from "../utils/Measure";
import PickResult from "@/types/PickResult";
import IfcEntity from "@/giro3d/IfcEntity";

export default class Picker {
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

    getAttributesFromPointCloud(pickedObject: PickResult, object: any, attributesGroups: AttributesGroups) {
        attributesGroups.get("Dataset")?.push({ key: 'Tile', value: object.name });
    }

    getAttributesFromCityObject(pickedObject: PickResult, object: any, attributesGroups: AttributesGroups) {
        if (!attributesGroups.has("CityJSON")) {
            attributesGroups.set("CityJSON", []);
        }
        const cityjsonAttributes = attributesGroups.get("CityJSON") as Attribute[];

        const cityjsonInfo = object.resolveIntersectionInfo(pickedObject);
        const cityobject = object.citymodel.CityObjects[cityjsonInfo.objectId];
        console.log(cityjsonInfo);

        cityjsonAttributes.push({ key: 'ID', value: cityjsonInfo.objectId });
        cityjsonAttributes.push({ key: 'Type', value: cityobject.type });

        const geometry = cityobject.geometry[cityjsonInfo.geometryIndex];
        cityjsonAttributes.push({ key: 'LoD', value: geometry.lod });

        const surface = geometry.semantics?.surfaces[cityjsonInfo.surfaceTypeIndex];
        if (surface) {
            cityjsonAttributes.push({ key: 'Surface type', value: surface.type });
        }
    }

    getAttributesFromObject3D(layer: any, object: Object3D, attributesGroups: AttributesGroups) {
        if (!attributesGroups.has("Feature")) {
            attributesGroups.set("Feature", []);
        }
        const attributes = attributesGroups.get("Feature") as Attribute[];

        if (object?.userData) {
            if (layer?.type === 'FeatureCollection') {
                attributes.push({ key: 'fid', value: object.userData.id });
                for (const [key, value] of Object.entries(object.userData.properties)) {
                    if (key === 'geometry' || key === 'bbox') continue;
                    if (typeof value === 'object') continue;
                    attributes.push({ key, value });
                }
            } else {
                for (const [key, value] of Object.entries(object.userData)) {
                    if (key === 'geometry' || key === 'geometryProperty' || key === 'metadata' || key === 'entity') continue;
                    if (typeof value === 'object') continue;
                    attributes.push({ key, value });
                }
            }
        }
    }

    getAttributesFromIfcFragment(ifcEntity: IfcEntity, fragment: Fragment, itemId: string, attributesGroups: AttributesGroups) {
        // @ts-ignore IfcProperties defines indexes as numbers, but actually are strings
        if (fragment.group && fragment.group.properties && fragment.group.properties[itemId]) {
            if (!attributesGroups.has("IFC")) {
                attributesGroups.set("IFC", []);
            }
            const attributes = attributesGroups.get("IFC") as Attribute[];

            const properties = fragment.group.properties;
            // @ts-ignore IfcProperties defines indexes as numbers, but actually are strings
            const itemProperties = properties[itemId];
            const ifcProperties = ifcEntity.getProperties(itemId);

            const nullValue = 'NULL';
            const name = itemProperties.Name?.value ?? nullValue;

            attributes.push({ key: 'Site', value: ifcEntity.object3d.userData?.dataset?.name ?? nullValue });
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

            return name;
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
    getObjectAt(instance: Instance, e: MouseEvent, radius = 1): PickResult | null {
        // @ts-ignore
        const where = instance.getObjects((o: Object3D | Entity3D) => o.type !== 'Map' && (o as any).name !== 'plane');
        const picked = instance.pickObjectsAt(e, {
            radius,
            where,
        }).sort((a, b) => (a.distance - b.distance))
            .at(0);

        let layer = null;
        let rootobj: Object3D | null = null;
        let drawing = null;
        let ifcData: any = {};

        if (picked) {
            rootobj = picked.object;
            while (layer === null && rootobj !== null) {
                if (rootobj instanceof Drawing) {
                    drawing = rootobj;
                }

                if (rootobj.userData.entity) {
                    layer = rootobj.userData.entity;
                } else {
                    rootobj = rootobj.parent;
                }
            }

            if (layer && layer.isEntity3D && (layer as any)?.isIfcEntity) {
                const ifcEntity = layer as IfcEntity;
                const direction = new Vector3();
                direction.subVectors(picked.point, instance.camera.camera3D.position);
                direction.normalize();
                ifcData = ifcEntity.raycast(instance.camera.camera3D.position, direction);
            }

            return {
                ...picked,
                ...ifcData,
                layer,
                rootobj,
                drawing,
            };
        }
        return null;
    }

    /**
     * Gets the point on map or grid where the user clicked.
     *
     * @param e Mouse event
     * @param radius Radius - the smaller, the faster and more precise (but
     * may return nothing)
     * @returns Result or null if nothing found
     */
    getMapAt(instance: Instance, e: MouseEvent, radius = 0): PickResult | null {
        // @ts-ignore
        const where = instance.getObjects((o: Object3D | Entity3D) => o.type === 'Map' || (o as any).name !== 'plane');
        const picked = instance.pickObjectsAt(e, {
            radius,
            limit: (radius > 0 ? undefined : 1),
            where,
        }).sort((a, b) => (a.distance - b.distance))
            .at(0);
        return picked;
    }

    getVectorFeatureAt(instance: Instance, e: MouseEvent, radius = 1): PickResult | null {
        const pickedOnMap = this.getMapAt(instance, e, radius);
        if (pickedOnMap && pickedOnMap.layer?.type === 'Map') {
            const coord = pickedOnMap.coord;
            const parentMap = pickedOnMap.layer;
            const tile = pickedOnMap.object;

            const feature = parentMap.getVectorFeaturesAtCoordinate(coord, 10, tile).at(0);
            if (feature) {
                return {
                    point: pickedOnMap.point,
                    layer: feature.layer,
                    feature: feature.feature,
                    rootobj: parentMap.object3d,
                };
            }
        }
        return null;
    }

    getFirstFeatureAt(instance: Instance, e: MouseEvent, radius = 1): PickResult | null {
        const picked = this.getObjectAt(instance, e, radius);
        if (picked) {
            return picked;
        }

        const pickedOnMap = this.getVectorFeatureAt(instance, e, radius);
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

    getAttributesFromDrawing(drawing: Drawing, attributesGroups: AttributesGroups) {
        if (!attributesGroups.has("Measurement")) {
            attributesGroups.set("Measurement", []);
        }
        const attributes = attributesGroups.get("Measurement") as Attribute[];

        const perimeter = Measure.getPerimeter(drawing);
        const minmax = Measure.getMinMaxAltitudes(drawing);
        const area = Measure.getArea(drawing);
        const unit = 'm';
        if (area !== null) {
            attributes.push({ key: 'Area', value: `${area.toFixed(2)}${unit}²` });
        }
        if (perimeter !== null) {
            attributes.push({ key: 'Perimeter', value: `${perimeter.toFixed(2)}${unit}` });
        }
        if (minmax !== null && Number.isFinite(minmax[0])) {
            attributes.push({ key: 'Min altitude', value: `${minmax[0].toFixed(2)}${unit}` });
            attributes.push({ key: 'Max altitude', value: `${minmax[1].toFixed(2)}${unit}` });
        }
    }

    getFeatureFromPickedObject(pickedObject: PickResult): Feature {
        const {
            layer, drawing, object, feature,
        } = pickedObject;

        const datasetAttributes: Array<Attribute> = [];
        const attributesGroups = new Map<string, Array<Attribute>>();
        attributesGroups.set("Dataset", datasetAttributes);

        const entity = layer as Entity3D;
        let name = entity?.object3d?.userData?.dataset?.name;

        if (layer?.filename) {
            datasetAttributes.push({ key: 'Dataset', value: layer.filename });
        } else if (layer.type === 'ColorLayer') {
            datasetAttributes.push({ key: 'Layer', value: layer.id });
        }

        // attributes.push({ key: 'Id', value: rootobj.uuid });

        // if (object) {
        //     this.getGeometryAttributes(object, attributes);
        // }

        if (drawing) {
            this.getAttributesFromDrawing(drawing, attributesGroups);
        }

        if ((object as any)?.isPointCloud) {
            this.getAttributesFromPointCloud(pickedObject, object, attributesGroups);
        }

        if ((object as any)?.isCityObject && pickedObject.face) {
            this.getAttributesFromCityObject(pickedObject, object, attributesGroups);
        }

        if (object?.userData) {
            this.getAttributesFromObject3D(pickedObject.layer, object, attributesGroups);
        }

        if (feature) {
            const featureName = this.getNameFromOLFeature(feature);
            name = featureName ?? name;
            this.getAttributesFromOLFeature(feature, attributesGroups);
        }

        if (entity.isEntity3D && (entity as any)?.isIfcEntity && pickedObject.mesh && pickedObject.itemId) {
            const ifcEntity = entity as IfcEntity;
            this.getAttributesFromIfcFragment(ifcEntity, pickedObject.mesh.fragment, pickedObject.itemId, attributesGroups);
        }

        return new Feature(name, layer?.id, attributesGroups, pickedObject.point);
    }

    getMouseCoordinate(instance: Instance, event: MouseEvent): Vector3 | null {
        // @ts-ignore
        const where = instance.getObjects((o: Object3D | Entity3D) => o.type === 'Map');

        const picked = instance.pickObjectsAt(event, {
            radius: 0,
            limit: 1,
            where,
        }).at(0);
        return picked?.point;
    }

    pick(instance: Instance, event: MouseEvent): { point: Vector3, feature: Feature | null, pickResult: PickResult } | null {
        const picked = this.getFirstFeatureAt(instance, event);
        if (picked === null) return null;

        let feature = null;
        if (picked.layer || picked.rootobj) {
            feature = this.getFeatureFromPickedObject(picked);
        }

        return { feature, point: picked.point, pickResult: picked };
    }
}
