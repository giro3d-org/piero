import { Material, Matrix4, MeshBasicMaterial, Vector2 } from 'three';
import { Fragment } from 'bim-fragment/fragment';
import { FragmentsGroup } from 'bim-fragment/fragments-group';
import { FragmentMesh } from 'bim-fragment/fragment-mesh';
import {
    Components,
    FragmentManager,
    FragmentIdMap,
    toCompositeID,
    IfcPropertiesUtils,
    FragmentClassifier,
    FragmentBoundingBox,
} from 'openbim-components';
import { Entity3D } from '@giro3d/giro3d/entities';
import { PickOptions, PickResult, PickableFeatures } from '@giro3d/giro3d/core/picking';
import { isObject } from '@/utils/Types';

// Copied/extract quite a lot from openbim-components library:
// - src/fragments/FragmentHighlighter/index.ts for highlighting
// - src/fragments/FragmentClassifier/index.ts for classification
// - src/ifc/IfcPropertiesProcessor/index.ts for property-related stuff

///// HIGHLIGHTING

const tempMatrix = new Matrix4();

type FragmentTypeName = 'selection' | 'bbox';

type SelectionMap = {
    [name in FragmentTypeName]: FragmentIdMap;
};
type MaterialMap = {
    [name in FragmentTypeName]: Material;
};

const materials: MaterialMap = {
    selection: new MeshBasicMaterial({
        color: '#FF0000',
        transparent: true,
        opacity: 0.6,
        depthTest: false,
    }),
    bbox: new MeshBasicMaterial({
        color: '#FFFF00',
        transparent: true,
        opacity: 0.2,
        depthTest: true,
    }),
};

///// PROPERTIES

interface IndexMap {
    [expressID: string]: Set<number>;
}

// Re-defined from Web-ifc
const IFCRELDEFINESBYPROPERTIES = 4186316022;
const IFCRELDEFINESBYTYPE = 781010003;
const IFCRELASSOCIATESMATERIAL = 2655215786;
const IFCRELCONTAINEDINSPATIALSTRUCTURE = 3242617779;
const IFCRELASSOCIATESCLASSIFICATION = 919958153;
const IFCRELASSIGNSTOGROUP = 1307041759;
const IFCPROPERTYSET = 1451395588;
const IFCELEMENTQUANTITY = 1883228015;

// IFC properties we want to explore
const setEntities = [IFCPROPERTYSET, IFCELEMENTQUANTITY];

// IFC relations we want to process to extract properties
const relationsToProcess = [
    IFCRELDEFINESBYPROPERTIES,
    IFCRELDEFINESBYTYPE,
    IFCRELASSOCIATESMATERIAL,
    IFCRELCONTAINEDINSPATIALSTRUCTURE,
    IFCRELASSOCIATESCLASSIFICATION,
    IFCRELASSIGNSTOGROUP,
];

///// CLASSIFICATION

export enum ClassificationSystem {
    STOREY = 'storeys',
    ENTITY = 'entities',
}

export type ClassificationItem = {
    name: string;
    treeItemName: string;
    children: ClassificationItem[];
    fragments: FragmentIdMap;
};

export interface IFCProperty {
    parentName: string;
    name: string;
    value: number | null;
}

export interface IFCFeature {
    itemProperties: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [attribute: string]: any;
    };
    ifcProperties: IFCProperty[];
}

export interface IFCPickResult extends PickResult<IFCFeature> {
    isIFCPickResult: true;
    entity: IfcEntity;
    object: FragmentMesh;
    features?: IFCFeature[];
}

export const isIFCPickResult = (obj: unknown): obj is IFCPickResult =>
    isObject(obj) && (obj as IFCPickResult).isIFCPickResult;

export default class IfcEntity
    extends Entity3D
    implements PickableFeatures<IFCFeature, IFCPickResult>
{
    readonly isIfcEntity = true;
    readonly isPickableFeatures = true;
    readonly components: Components;
    readonly fragmentManager: FragmentManager;
    readonly fragmentClassifier: FragmentClassifier;
    private _ifcSelection: SelectionMap; // Currently selected fragments
    private _indexMap: IndexMap; // Properties relationships
    private _classificationCache: ClassificationItem[] | null;
    private _fragmentBoundingBox: FragmentBoundingBox | null;

    override get object3d(): FragmentsGroup {
        return super.object3d as FragmentsGroup;
    }

    constructor(
        root: FragmentsGroup,
        components: Components,
        fragmentManager: FragmentManager,
        fragmentClassifier: FragmentClassifier,
    ) {
        super(root.uuid, root);

        this.components = components;
        this.fragmentManager = fragmentManager;
        this.fragmentClassifier = fragmentClassifier;
        this.type = 'IfcEntity';
        this._ifcSelection = { selection: {}, bbox: {} };
        this._indexMap = {};
        this._classificationCache = null;
        this._fragmentBoundingBox = null;
        this.initializeEntityIndexes();

        this.fragmentClassifier.byStorey(root);
        this.fragmentClassifier.byEntity(root);

        this.object3d.traverse(obj => {
            this.onObjectCreated(obj);
        });
    }

    private initializeEntityIndexes() {
        this._indexMap = {};
        const properties = this.object3d.properties;
        if (properties === undefined) return;

        for (const relation of relationsToProcess) {
            IfcPropertiesUtils.getRelationMap(properties, relation, (relationID, relatedIDs) => {
                const relationEntity = properties[relationID];
                if (!setEntities.includes(relationEntity.type)) this.setEntityIndex(relationID);
                for (const expressID of relatedIDs) {
                    this.setEntityIndex(expressID).add(relationID);
                }
            });
        }
    }

    private setEntityIndex(expressID: number) {
        if (!this._indexMap[expressID]) this._indexMap[expressID] = new Set();
        return this._indexMap[expressID];
    }

    getProperty(expressID: number): { name: string; value: number | null } | null {
        const properties = this.object3d.properties;
        if (properties === undefined) return null;

        const { name } = IfcPropertiesUtils.getEntityName(properties, expressID);
        if (name === null) return null;

        const { value } = IfcPropertiesUtils.getQuantityValue(properties, expressID);
        return { name, value };
    }

    getProperties(expressID: string): IFCProperty[] {
        const properties = [];
        const objectRawProperties = this.object3d.properties;
        if (!objectRawProperties) return [];

        for (const id of this._indexMap[expressID]) {
            const entity = objectRawProperties[id];
            if (!entity) continue;
            const { name } = IfcPropertiesUtils.getEntityName(objectRawProperties, id);
            if (name === null) continue;

            if (entity.type === IFCPROPERTYSET) {
                const psetPropsIds = IfcPropertiesUtils.getPsetProps(objectRawProperties, id);
                if (psetPropsIds !== null) {
                    for (const psetPropId of psetPropsIds) {
                        const psetProp = objectRawProperties[psetPropId];
                        if (!psetProp) continue;
                        const psetProperties = this.getProperty(psetPropId);
                        if (psetProperties === null) continue;
                        properties.push({
                            parentName: name,
                            ...psetProperties,
                        });
                    }
                }
            } else if (entity.type === IFCELEMENTQUANTITY) {
                const qsetQuantityIds = IfcPropertiesUtils.getQsetQuantities(
                    objectRawProperties,
                    id,
                );
                if (qsetQuantityIds !== null) {
                    for (const quantityId of qsetQuantityIds) {
                        const { key } = IfcPropertiesUtils.getQuantityValue(
                            objectRawProperties,
                            quantityId,
                        );
                        if (key === null) continue;
                        const qsetProperties = this.getProperty(quantityId);
                        if (qsetProperties === null) continue;
                        properties.push({
                            parentName: name,
                            ...qsetProperties,
                        });
                    }
                }
            }
        }

        return properties;
    }

    private async regenerateClassification(
        groupSystemNames: string[],
        result = {},
    ): Promise<ClassificationItem[]> {
        const systems = this.fragmentClassifier.get();
        const groups: ClassificationItem[] = [];
        const currentSystemName = groupSystemNames[0]; // storeys
        const systemGroups = systems[currentSystemName];

        if (!currentSystemName || !systemGroups) {
            return groups;
        }
        for (const name of Object.keys(systemGroups)) {
            // name is N00, N01, N02...
            // { storeys: "N00" }, { storeys: "N01" }...
            const filter = { ...result, [currentSystemName]: [name] };
            const found = (await this.fragmentClassifier.find(filter)) as FragmentIdMap;
            const hasElements = Object.keys(found).length > 0;

            if (hasElements) {
                const firstLetter = currentSystemName[0].toUpperCase();
                const treeItemName = firstLetter + currentSystemName.slice(1); // Storeys
                const children = await this.regenerateClassification(
                    groupSystemNames.slice(1),
                    filter,
                );

                groups.push({ name, treeItemName, children, fragments: found });
            }
        }
        return groups;
    }

    async initClassification(): Promise<void> {
        this._classificationCache = await this.regenerateClassification([
            ClassificationSystem.STOREY,
            ClassificationSystem.ENTITY,
        ]);
        if (this._classificationCache.length === 0) {
            // Maybe we don't have storeys, try to classify by entity
            this._classificationCache = await this.regenerateClassification([
                ClassificationSystem.ENTITY,
            ]);
        }
        this._fragmentBoundingBox = await this.components.tools.get(FragmentBoundingBox);
    }

    getClassification(): ClassificationItem[] {
        if (this._classificationCache === null)
            throw new Error('Must call initClassification before getClassification');
        return this._classificationCache;
    }

    private addHighlightToFragment(name: FragmentTypeName, fragment: Fragment) {
        if (!fragment.fragments[name]) {
            const subFragment = fragment.addFragment(name, [materials[name]]);
            if (fragment.blocks.count > 1) {
                subFragment.setInstance(0, {
                    ids: Array.from(fragment.ids),
                    transform: tempMatrix,
                });
                subFragment.blocks.setVisibility(false);
            }

            this.object3d.add(subFragment.mesh);

            subFragment.mesh.renderOrder = 30;
            subFragment.mesh.frustumCulled = false;
            subFragment.mesh.name = name;
            subFragment.mesh.updateMatrixWorld(true);
        }
    }

    clearHighlight(name: FragmentTypeName = 'selection') {
        for (const fragID of Object.keys(this._ifcSelection[name])) {
            const fragment = this.fragmentManager.list[fragID];
            if (!fragment) continue;
            const selection = fragment.fragments[name];
            if (selection) {
                selection.mesh.removeFromParent();
            }
        }
        this._instance.notifyChange(this);

        this._ifcSelection[name] = {};
    }

    private regenerate(name: FragmentTypeName, fragID: string) {
        this.updateFragmentFill(name, fragID);
    }

    private addComposites(name: FragmentTypeName, mesh: FragmentMesh, itemID: number) {
        this.addHighlightToFragment(name, mesh.fragment);
        const composites = mesh.fragment.composites[itemID];
        if (composites) {
            for (let i = 1; i < composites; i++) {
                const compositeID = toCompositeID(itemID, i);
                this._ifcSelection[name][mesh.uuid].add(compositeID);
            }
        }
    }

    private updateFragmentFill(name: FragmentTypeName, fragmentID: string) {
        const ids = this._ifcSelection[name][fragmentID];
        const fragment = this.fragmentManager.list[fragmentID];
        if (!fragment) return;
        const selection = fragment.fragments[name];
        if (!selection) return;

        const fragmentParent = fragment.mesh.parent;
        if (!fragmentParent) return;
        fragmentParent.add(selection.mesh);

        const isBlockFragment = selection.blocks.count > 1;
        if (isBlockFragment) {
            fragment.getInstance(0, tempMatrix);
            selection.setInstance(0, {
                ids: Array.from(fragment.ids),
                transform: tempMatrix,
            });

            selection.blocks.setVisibility(true, ids, true);
        } else {
            let i = 0;
            for (const id of ids) {
                selection.mesh.count = i + 1;
                const { instanceID } = fragment.getInstanceAndBlockID(id);
                fragment.getInstance(instanceID, tempMatrix);
                selection.setInstance(i, { ids: [id], transform: tempMatrix });
                i++;
            }
        }
    }

    highlight(name: FragmentTypeName, mesh: FragmentMesh, itemId: string) {
        this._ifcSelection[name][mesh.uuid] = new Set<string>();

        const idNum = parseInt(itemId, 10);
        this._ifcSelection[name][mesh.uuid].add(itemId);
        this.addComposites(name, mesh, idNum);
        this.regenerate(name, mesh.uuid);

        const group = mesh.fragment.group;
        if (group) {
            const keys = group.data[idNum][0];
            for (let i = 0; i < keys.length; i++) {
                const fragKey = keys[i];
                const fragID = group.keyFragments[fragKey];
                const fragment = this.fragmentManager.list[fragID];

                if (!this._ifcSelection[name][fragID]) {
                    this._ifcSelection[name][fragID] = new Set<string>();
                }
                this._ifcSelection[name][fragID].add(itemId);
                this.addComposites(name, fragment.mesh, idNum);
                this.regenerate(name, fragID);
            }
        }
        this._instance.notifyChange(this);
    }

    highlightById(ids: FragmentIdMap, name: FragmentTypeName = 'selection') {
        for (const fragID of Object.keys(ids)) {
            if (!this._ifcSelection[name][fragID]) {
                this._ifcSelection[name][fragID] = new Set<string>();
            }

            const fragment = this.fragmentManager.list[fragID];

            const idsNum = new Set<number>();
            for (const id of ids[fragID]) {
                this._ifcSelection[name][fragID].add(id);
                idsNum.add(parseInt(id, 10));
            }
            for (const id of idsNum) {
                this.addComposites(name, fragment.mesh, id);
            }
            this.regenerate(name, fragID);
        }

        this._instance.notifyChange(this);
    }

    getBoundingBoxById(ids: FragmentIdMap) {
        this.clearHighlight('bbox');
        this.highlightById(ids, 'bbox');

        const bbox = this._fragmentBoundingBox;
        if (bbox === null)
            throw new Error('Must call initClassification before getBoundingBoxById');

        const fragments = this.fragmentManager;
        bbox.reset();

        const selected = this._ifcSelection.bbox;
        if (!Object.keys(selected).length) {
            return;
        }
        for (const fragID of Object.keys(selected)) {
            const fragment = fragments.list[fragID];
            const highlight = fragment.fragments['bbox'];
            bbox.addMesh(highlight.mesh);
        }

        const box = bbox.get();

        // since Giro3D is Z-up, we need to swap Y and Z, and then invert the sign of
        // the new Y (i.e the Z before the swap).
        const { y: ymin, z: zmin } = box.min;
        const { y: ymax, z: zmax } = box.max;

        box.min.y = -zmax;
        box.max.y = -zmin;
        box.min.z = ymin;
        box.max.z = ymax;

        box.translate(this.object3d.position);

        this.clearHighlight('bbox');
        return box;
    }

    pick(canvasCoords: Vector2, options?: PickOptions): IFCPickResult[] {
        return super.pick(canvasCoords, options).map(p => ({
            ...p,
            entity: this,
            object: p.object as FragmentMesh,
            features: p.features as IFCFeature[] | undefined,
            isIFCPickResult: true,
        }));
    }

    pickFeaturesFrom(pickedResult: IFCPickResult) {
        const mesh = pickedResult.object;
        if (mesh.fragment && pickedResult.instanceId != null && pickedResult.face) {
            const blockId = mesh.fragment.getVertexBlockID(mesh.geometry, pickedResult.face.a);

            const itemId = mesh.fragment
                .getItemID(pickedResult.instanceId, blockId)
                ?.replace(/\..*/, '');

            // @ts-expect-error IfcProperties defines indexes as numbers, but actually are strings
            if (itemId && mesh.fragment.group?.properties?.[itemId]) {
                const properties = mesh.fragment.group.properties;
                // @ts-expect-error IfcProperties defines indexes as numbers, but actually are strings
                const itemProperties = properties[itemId];
                const ifcProperties = this.getProperties(itemId);

                const result = [{ itemProperties, ifcProperties }];
                pickedResult.features = result;
                return result;
            }
        }
        return [];
    }

    static isIFCEntity = (obj: unknown): obj is IfcEntity =>
        isObject(obj) && (obj as IfcEntity).isIfcEntity;
    static isIFCPickResult = (obj: unknown): obj is IFCPickResult =>
        isObject(obj) && IfcEntity.isIFCEntity((obj as PickResult<unknown>).entity);
}
