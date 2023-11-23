import { Box3, Face, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "three";
import * as ifc from "three/examples/jsm/loaders/IFCLoader";
import Instance from "@giro3d/giro3d/core/Instance";
import Drawing from "@giro3d/giro3d/interactions/Drawing";
import { Feature as OLFeature } from "ol";
import Feature, { Attribute } from "@/types/Feature";
import Measure from "../utils/Measure";
import Entity3D from "@giro3d/giro3d/entities/Entity3D";
import PickResult from "@/types/PickResult";
export default class Picker {
    getNameFromOLFeature(feature: OLFeature): string {
        return feature.get('nom')
            ?? feature.get('name')
            ?? feature.getId();
    }

    getAttributesFromOLFeature(feature: OLFeature, attributes: Array<Attribute>) {
        if (feature.getId() !== undefined) {
            attributes.push({ key: 'fid', value: feature.getId() });
        }
        for (const [key, value] of Object.entries(feature.getProperties())) {
            if (key === 'geometry' || key === 'geometryProperty') continue;
            attributes.push({ key, value });
        }
    }

    getAttributesFromCityObject(pickedObject: PickResult, object: any, attributes: Array<Attribute>) {
        const cityjsonInfo = object.resolveIntersectionInfo(pickedObject);
        const cityobject = object.citymodel.CityObjects[cityjsonInfo.objectId];
        console.log(cityjsonInfo);

        attributes.push({ key: 'CityJSON ID', value: cityjsonInfo.objectId });
        attributes.push({ key: 'CityJSON type', value: cityobject.type });

        const geometry = cityobject.geometry[cityjsonInfo.geometryIndex];
        attributes.push({ key: 'LoD', value: geometry.lod });

        const surface = geometry.semantics.surfaces[cityjsonInfo.surfaceTypeIndex];
        attributes.push({ key: 'Surface type', value: surface.type });
    }

    getAttributesFromObject3D(layer: any, object: Object3D, attributes: Array<Attribute>) {
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

    getAttributesFromIfc(ifcModel: ifc.IFCModel, faceIndex: number, attributes: Attribute[]) {
        const modelID = ifcModel.modelID;
        const id = ifcModel.ifcManager.getExpressId(ifcModel.geometry, faceIndex);
        const properties = ifcModel.ifcManager.getItemProperties(modelID, id, true);
        const nullValue = 'NULL';
        const name = properties.Name?.value ?? nullValue;

        ifcModel.ifcManager.getIfcType
        attributes.push({ key: 'Site', value: ifcModel?.userData?.dataset?.name ?? nullValue });
        attributes.push({ key: 'IFCType', value: ifcModel.ifcManager.getIfcType(modelID, id) ?? nullValue });
        attributes.push({ key: 'Name', value: name });
        attributes.push({ key: 'ID', value: properties.expressID });
        attributes.push({ key: 'GlobalId', value: properties.GlobalId?.value ?? nullValue });
        attributes.push({ key: 'Description', value: properties.Description?.value ?? nullValue });
        attributes.push({ key: 'PredefinedType', value: properties.PredefinedType?.value ?? nullValue });
        attributes.push({ key: 'ObjectType', value: properties.ObjectType?.value ?? nullValue });

        return name;
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
        const where = instance.getObjects((o: Object3D | Entity3D) => o.type !== 'Map');
        const picked = instance.pickObjectsAt(e, {
            radius,
            where,
        }).sort((a, b) => (a.distance - b.distance))
          .at(0);

        let layer = null;
        let rootobj : Object3D = null;
        let drawing = null;

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

            return {
                ...picked,
                layer,
                rootobj,
                drawing,
            };
        }
        return {
            point: picked?.point,
        };
    }

    getVectorFeatureAt(instance: Instance, e: MouseEvent, radius = 1): PickResult {
        const pickedOnMap = instance.pickObjectsAt(e, { limit: 1, radius }).at(0);
        if (pickedOnMap && pickedOnMap.layer?.type === 'Map') {
            const coord = pickedOnMap.coord;
            const parentMap = pickedOnMap.layer;
            const tile = pickedOnMap.object;

            const feature = parentMap.getVectorFeaturesAtCoordinate(coord, 10, tile).at(0);
            if (feature) {
                return {
                    layer: feature.layer,
                    feature: feature.feature,
                    rootobj: parentMap.object3d,
                };
            }
        }
        return null;
    }

    getFirstFeatureAt(instance: Instance, e: MouseEvent, radius = 1): PickResult {
        const picked = this.getObjectAt(instance, e, radius);
        if (picked.layer || picked.rootobj) {
            return picked;
        }

        const pickedOnMap = this.getVectorFeatureAt(instance, e, radius);
        if (pickedOnMap) {
            return pickedOnMap;
        }

        return picked;
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

    getAttributesFromDrawing(drawing: Drawing, attributes: Array<Attribute>) {
        const perimeter = Measure.getPerimeter(drawing);
        const minmax = Measure.getMinMaxAltitudes(drawing);
        const area = Measure.getArea(drawing);
        const unit = 'm';
        if (area !== null) {
            attributes.push({ key: 'Area', value: `${area.toFixed(2)}${unit}²` });
        }
        if (perimeter !== null) {
            attributes.push({ key: 'Perimeter', value: `${perimeter.toFixed(2)}${unit}`});
        }
        if (minmax !== null && Number.isFinite(minmax[0])) {
            attributes.push({ key: 'Min altitude', value: `${minmax[0].toFixed(2)}${unit}` });
            attributes.push({ key: 'Max altitude', value: `${minmax[1].toFixed(2)}${unit}`});
        }
    }

    getFeatureFromPickedObject(pickedObject: PickResult): Feature {
        const {
            layer, rootobj, drawing, object, feature,
        } = pickedObject;

        const attributes: Array<Attribute> = [];

        const entity = layer as Entity3D;
        let name = entity?.object3d?.userData?.dataset?.name;

        if (layer?.filename) {
            attributes.push({ key: 'Dataset', value: layer.filename });
        } else if (layer.type === 'ColorLayer') {
            attributes.push({ key: 'Layer', value: layer.id });
        }

        // attributes.push({ key: 'Id', value: rootobj.uuid });

        // if (object) {
        //     this.getGeometryAttributes(object, attributes);
        // }

        if (drawing) {
            this.getAttributesFromDrawing(drawing, attributes);
        }

        if ((object as any)?.isCityObject && pickedObject.face) {
            this.getAttributesFromCityObject(pickedObject, object, attributes);
        }

        if (object?.userData) {
            this.getAttributesFromObject3D(pickedObject.layer, object, attributes);
        }

        if (feature) {
            const featureName = this.getNameFromOLFeature(feature);
            name = featureName ?? name;
            this.getAttributesFromOLFeature(feature, attributes);
        }

        if (entity.isEntity3D && entity.object3d.modelID !== undefined) {
            const ifcModel = entity.object3d as ifc.IFCModel;
            name = this.getAttributesFromIfc(ifcModel, pickedObject.faceIndex, attributes);
        }

        return new Feature(name, layer?.id, attributes);
    }

    getMouseCoordinate(instance: Instance, event: MouseEvent) : Vector3 | null {
        const where = instance.getObjects((o: Object3D | Entity3D) => o.type === 'Map');

        const picked = instance.pickObjectsAt(event, {
            radius: 1,
            where,
        });

        const first = picked
            .sort((a, b) => (a.distance - b.distance))
            .at(0) as { point?: Vector3 };

        return first?.point;
    }

    pick(instance: Instance, event: MouseEvent): { point: Vector3, feature: Feature, pickResult: PickResult } | null {
        const picked = this.getFirstFeatureAt(instance, event);
        let feature = null;
        if (picked.layer || picked.rootobj) {
            feature = this.getFeatureFromPickedObject(picked);
        }

        return { feature, point: picked.point, pickResult: picked };
    }
}