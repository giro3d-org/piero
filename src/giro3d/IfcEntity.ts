import { Entity3D } from "@giro3d/giro3d/entities";
import { Fragment } from "bim-fragment/fragment";
import { FragmentsGroup } from 'bim-fragment/fragments-group';
import { FragmentMesh } from 'bim-fragment/fragment-mesh';
import { Components, FragmentManager, FragmentIdMap, toCompositeID, SimpleRaycaster, IfcPropertiesUtils, FragmentClassifier } from 'openbim-components';
import { Matrix4, MeshBasicMaterial, Vector3 } from "three";

// Copied/extract quite a lot from openbim-components library:
// - src/fragments/FragmentHighlighter/index.ts for highlighting
// - src/fragments/FragmentClassifier/index.ts for classification
// - src/ifc/IfcPropertiesProcessor/index.ts for property-related stuff

///// HIGHLIGHTING

const highlightMaterial = new MeshBasicMaterial({
    color: "#FF0000",
    transparent: true,
    opacity: 0.6,
    depthTest: true,
});
const tempMatrix = new Matrix4();
const selectionFragmentName = "selection";

///// PROPERTIES

interface IndexMap {
    [expressID: string]: Set<number>
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
    STOREY = "storeys",
    ENTITY = "entities",
}

export type ClassificationItem = {
    name: string;
    treeItemName: string;
    children: ClassificationItem[],
    fragments: FragmentIdMap,
}


export default class IfcEntity extends Entity3D {
    readonly isIfcEntity = true;
    readonly components: Components;
    readonly fragmentManager: FragmentManager;
    readonly fragmentClassifier: FragmentClassifier;
    private ifcSelection: FragmentIdMap; // Currently selected fragments
    private indexMap: IndexMap; // Properties relationships
    private classificationCache: ClassificationItem[];

    override get object3d(): FragmentsGroup { return super.object3d as FragmentsGroup };

    constructor(root: FragmentsGroup, components: Components, fragmentManager: FragmentManager, fragmentClassifier: FragmentClassifier) {
        super(root.uuid, root);

        this.components = components;
        this.fragmentManager = fragmentManager;
        this.fragmentClassifier = fragmentClassifier;
        this.type = 'IfcEntity';
        this.ifcSelection = {};
        this.initializeEntityIndexes();
        this.initializeIfcHightlight();

        this.fragmentClassifier.byStorey(root);
        this.fragmentClassifier.byEntity(root);
    }

    private initializeEntityIndexes() {
        this.indexMap = {};
        const properties = this.object3d.properties;

        for (const relation of relationsToProcess) {
            IfcPropertiesUtils.getRelationMap(
                properties,
                relation,
                (relationID, relatedIDs) => {
                    const relationEntity = properties[relationID];
                    if (!setEntities.includes(relationEntity.type))
                        this.setEntityIndex(relationID);
                    for (const expressID of relatedIDs) {
                        this.setEntityIndex(expressID).add(relationID);
                    }
                }
            );
        }
    }

    private setEntityIndex(expressID: number) {
        if (!this.indexMap[expressID])
            this.indexMap[expressID] = new Set();
        return this.indexMap[expressID];
    }

    getProperty(
        expressID: number,
    ): { name: string, value: any } {
        const { name } = IfcPropertiesUtils.getEntityName(
            this.object3d.properties,
            expressID
        );
        const { value } = IfcPropertiesUtils.getQuantityValue(
            this.object3d.properties,
            expressID
        );
        return { name, value };
    }

    getProperties(expressID: string): { parentName: string, name: string, value: any }[] {
        const properties = [];

        for (const id of this.indexMap[expressID]) {
            const entity = this.object3d.properties[id];
            if (!entity) continue;
            const { name } = IfcPropertiesUtils.getEntityName(this.object3d.properties, id);

            if (entity.type === IFCPROPERTYSET) {
                const psetPropsIds = IfcPropertiesUtils.getPsetProps(
                    this.object3d.properties,
                    id);
                for (const psetPropId of psetPropsIds) {
                    const prop = this.object3d.properties[psetPropId];
                    if (prop) properties.push({
                        parentName: name,
                        ...this.getProperty(psetPropId)
                    });
                };
            } else if (entity.type === IFCELEMENTQUANTITY) {
                const qsetQuantityIds = IfcPropertiesUtils.getQsetQuantities(this.object3d.properties, id);
                for (const quantityId of qsetQuantityIds) {
                    const { key } = IfcPropertiesUtils.getQuantityValue(
                        this.object3d.properties,
                        quantityId
                    );
                    if (key) properties.push({
                        parentName: name,
                        ...this.getProperty(quantityId)
                    });
                }
            }
        }

        return properties;
    }

    private async regenerateClassification(groupSystemNames: string[], result = {}): Promise<ClassificationItem[]> {
        const systems = this.fragmentClassifier.get();
        const groups: ClassificationItem[] = [];
        const currentSystemName = groupSystemNames[0]; // storeys
        const systemGroups = systems[currentSystemName];

        if (!currentSystemName || !systemGroups) {
            return groups;
        }
        for (const name in systemGroups) {
            // name is N00, N01, N02...
            // { storeys: "N00" }, { storeys: "N01" }...
            const filter = { ...result, [currentSystemName]: [name] };
            const found = await this.fragmentClassifier.find(filter) as FragmentIdMap;
            const hasElements = Object.keys(found).length > 0;

            if (hasElements) {
                const firstLetter = currentSystemName[0].toUpperCase();
                const treeItemName = firstLetter + currentSystemName.slice(1); // Storeys
                const children = await this.regenerateClassification(
                    groupSystemNames.slice(1),
                    filter
                );

                groups.push({ name, treeItemName, children, fragments: found });
            }
        }
        return groups;
    }

    async initClassification(): Promise<void> {
        this.classificationCache = await this.regenerateClassification([ClassificationSystem.STOREY, ClassificationSystem.ENTITY]);
        if (this.classificationCache.length === 0) {
            // Maybe we don't have storeys, try to classify by entity
            this.classificationCache = await this.regenerateClassification([ClassificationSystem.ENTITY]);
        }
    }

    getClassification(): ClassificationItem[] {
        return this.classificationCache;
    }

    private initializeIfcHightlight() {
        for (const fragmentID in this.fragmentManager.list) {
            const fragment = this.fragmentManager.list[fragmentID];
            this.addHighlightToFragment(fragment);
        }
    }

    private addHighlightToFragment(fragment: Fragment) {
        if (!fragment.fragments[selectionFragmentName]) {
            const subFragment = fragment.addFragment(selectionFragmentName, [highlightMaterial]);
            if (fragment.blocks.count > 1) {
                subFragment.setInstance(0, {
                    ids: Array.from(fragment.ids),
                    transform: tempMatrix,
                });
                subFragment.blocks.setVisibility(false);
            }

            this.object3d.add(subFragment.mesh);

            subFragment.mesh.renderOrder = 10;
            subFragment.mesh.frustumCulled = false;
            subFragment.mesh.name = 'highlight';
            subFragment.mesh.updateMatrixWorld(true);
        }
    }

    clearHighlight() {
        for (const fragID in this.ifcSelection) {
            const fragment = this.fragmentManager.list[fragID];
            if (!fragment) continue;
            const selection = fragment.fragments[selectionFragmentName];
            if (selection) {
                selection.mesh.removeFromParent();
            }
        }
        this._instance.notifyChange();

        this.ifcSelection = {};
    }

    private regenerate(fragID: string) {
        this.updateFragmentFill(fragID);
    }

    private addComposites(mesh: FragmentMesh, itemID: number) {
        const composites = mesh.fragment.composites[itemID];
        if (composites) {
            for (let i = 1; i < composites; i++) {
                const compositeID = toCompositeID(itemID, i);
                this.ifcSelection[mesh.uuid].add(compositeID);
            }
        }
    }

    private updateFragmentFill(fragmentID: string) {
        const ids = this.ifcSelection[fragmentID];
        const fragment = this.fragmentManager.list[fragmentID];
        if (!fragment) return;
        const selection = fragment.fragments[selectionFragmentName];
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

    highlight(mesh: FragmentMesh, itemId: string) {
        this.ifcSelection[mesh.uuid] = new Set<string>();

        const idNum = parseInt(itemId, 10);
        this.ifcSelection[mesh.uuid].add(itemId);
        this.addComposites(mesh, idNum);
        this.regenerate(mesh.uuid);

        const group = mesh.fragment.group;
        if (group) {
            const keys = group.data[idNum][0];
            for (let i = 0; i < keys.length; i++) {
                const fragKey = keys[i];
                const fragID = group.keyFragments[fragKey];
                const fragment = this.fragmentManager.list[fragID];

                if (!this.ifcSelection[fragID]) {
                    this.ifcSelection[fragID] = new Set<string>();
                }
                this.ifcSelection[fragID].add(itemId);
                this.addComposites(fragment.mesh, idNum);
                this.regenerate(fragID);
            }
        }
        this._instance.notifyChange();
    }

    highlightById(ids: FragmentIdMap) {
        for (const fragID in ids) {
            if (!this.ifcSelection[fragID]) {
                this.ifcSelection[fragID] = new Set<string>();
            }

            const fragment = this.fragmentManager.list[fragID];

            const idsNum = new Set<number>();
            for (const id of ids[fragID]) {
                this.ifcSelection[fragID].add(id);
                idsNum.add(parseInt(id, 10));
            }
            for (const id of idsNum) {
                this.addComposites(fragment.mesh, id);
            }
            this.regenerate(fragID);
        }

        this._instance.notifyChange();
    }

    raycast(origin: Vector3, direction: Vector3): {
        mesh: FragmentMesh,
        blockId: number,
        itemId: string,
    } | null {
        const fragments = this.fragmentManager;

        const result = (this.components.raycaster as SimpleRaycaster).castRayFromVector(origin, direction, fragments.meshes);

        if (!result) {
            return null;
        }

        const mesh = result.object as FragmentMesh;
        const geometry = mesh.geometry;
        const index = result.face?.a;
        const instanceID = result.instanceId;

        if (!geometry || index === undefined || instanceID === undefined) {
            return null;
        }

        const blockId = mesh.fragment.getVertexBlockID(geometry, index);

        const itemId = mesh.fragment
            .getItemID(instanceID, blockId)
            .replace(/\..*/, "");

        return {
            mesh,
            blockId,
            itemId,
        };
    }
}
