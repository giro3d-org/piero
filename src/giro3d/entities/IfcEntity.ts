import { fillObject3DUserData } from '@/loaders/userData';
import Fetcher from '@/utils/Fetcher';
import { isObject } from '@/utils/Types';
import type PickOptions from '@giro3d/giro3d/core/picking/PickOptions';
import type PickResult from '@giro3d/giro3d/core/picking/PickResult';
import type PickableFeatures from '@giro3d/giro3d/core/picking/PickableFeatures';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type { Fragment } from 'bim-fragment/fragment';
import type { FragmentMesh } from 'bim-fragment/fragment-mesh';
import type { FragmentsGroup } from 'bim-fragment/fragments-group';
import type { FragmentIdMap } from 'openbim-components';
import {
    Components,
    FragmentBoundingBox,
    FragmentClassifier,
    FragmentIfcLoader,
    FragmentManager,
    IfcPropertiesUtils,
    SimpleCamera,
    SimpleRaycaster,
    SimpleRenderer,
    SimpleScene,
    toCompositeID,
} from 'openbim-components';
import type { Material, Vector2 } from 'three';
import { Group, Matrix4, MeshBasicMaterial, Vector3 } from 'three';
import type { CoordinatesMixin, UrlOrDataMixin } from '../sources/mixins';

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

/** Source interface for {@link IfcEntity} */
export interface IfcSource extends UrlOrDataMixin, CoordinatesMixin {
    /** Name of the IFC */
    name: string;
}

/**
 * Entity for displaying an IFC file
 */
export default class IfcEntity
    extends Entity3D
    implements PickableFeatures<IFCFeature, IFCPickResult>
{
    readonly isIfcEntity = true as const;
    readonly isPickableFeatures = true as const;
    readonly type = 'IfcEntity' as const;

    private readonly _source: IfcSource;

    private _components: Components;
    private _model!: FragmentsGroup;
    private _fragmentManager!: FragmentManager;
    private _fragmentClassifier!: FragmentClassifier;
    private _ifcSelection: SelectionMap; // Currently selected fragments
    private _indexMap: IndexMap; // Properties relationships
    private _classificationCache: ClassificationItem[] | null;
    private _fragmentBoundingBox: FragmentBoundingBox | null;

    constructor(source: IfcSource) {
        super(new Group());
        this._source = source;

        this._components = new Components();
        this._components.ui.enabled = false;

        this._components.scene = new SimpleScene(this._components);
        this._components.renderer = new SimpleRenderer(
            this._components,
            document.createElement('div'),
        );
        this._components.camera = new SimpleCamera(this._components);
        this._components.raycaster = new SimpleRaycaster(this._components);

        this._components.init();

        this._ifcSelection = { selection: {}, bbox: {} };
        this._indexMap = {};
        this._classificationCache = null;
        this._fragmentBoundingBox = null;
    }

    protected async preprocess(): Promise<void> {
        const data = await Fetcher.fetchArrayBuffer(this._source.url);

        this._fragmentManager = await this._components.tools.get(FragmentManager);

        this._fragmentClassifier = await this._components.tools.get(FragmentClassifier);
        const fragmentIfcLoader = new FragmentIfcLoader(this._components);

        fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
        fragmentIfcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;

        const buffer = new Uint8Array(data);
        this._model = await fragmentIfcLoader.load(buffer, this._source.name);

        // IFC models are Y-up, so we need to rotate them to be Z-up.
        this._model.rotateX(Math.PI / 2);

        const position = new Vector3();
        // If custom coordinates are provided, we ignore the IFC's placement
        if (this._source.at) {
            this._source.at.toVector3(position);
            this._model.position.copy(position);
        } else {
            // Since we are loading the model with COORDINATE_TO_ORIGIN = true, all vertices will be
            // expressed as an offset from the root object, rather than their absolute world space
            // positions. We then have to compute a transformation matrix to put the object back in
            // its original position.
            // For this, we use the undocumented coordination matrix which is the transformation
            // from world to local space.
            //
            // However, since Giro3D is Z-up, we need to swap Y and Z, and then invert the sign of
            // the new Y (i.e the Z before the swap).
            //
            // Important note: the IFC's origin is not transformed to the instance's CRS. We assume that
            // The IFC file is in the same coordinate system as the instance.
            const coordinationMatrix = this._model.coordinationMatrix.clone().invert();
            position.applyMatrix4(coordinationMatrix);
            this._model.position.set(position.x, -position.z, position.y);
        }

        this._model.updateWorldMatrix(true, true);
        this._model.updateMatrix();
        this._model.updateMatrixWorld(true);
        this.initializeEntityIndexes();

        this._fragmentClassifier.byStorey(this._model);
        this._fragmentClassifier.byEntity(this._model);

        await this.initClassification();

        this.object3d.add(this._model);
        this.onObjectCreated(this._model);

        const context = Fetcher.getContext(this._source.url);
        fillObject3DUserData(this, { filename: context.filename });

        this.notifyChange(this.object3d);
    }

    private initializeEntityIndexes() {
        this._indexMap = {};
        const properties = this._model.properties;
        if (properties === undefined) {
            return;
        }

        for (const relation of relationsToProcess) {
            IfcPropertiesUtils.getRelationMap(properties, relation, (relationID, relatedIDs) => {
                const relationEntity = properties[relationID];
                if (!setEntities.includes(relationEntity.type)) {
                    this.setEntityIndex(relationID);
                }
                for (const expressID of relatedIDs) {
                    this.setEntityIndex(expressID).add(relationID);
                }
            });
        }
    }

    private setEntityIndex(expressID: number) {
        if (!(expressID in this._indexMap)) {
            this._indexMap[expressID] = new Set();
        }
        return this._indexMap[expressID];
    }

    getProperty(expressID: number): { name: string; value: number | null } | null {
        const properties = this._model.properties;
        if (properties === undefined) {
            return null;
        }

        const { name } = IfcPropertiesUtils.getEntityName(properties, expressID);
        if (name === null) {
            return null;
        }

        const { value } = IfcPropertiesUtils.getQuantityValue(properties, expressID);
        return { name, value };
    }

    getProperties(expressID: string): IFCProperty[] {
        const properties = [];
        const objectRawProperties = this._model.properties;
        if (!objectRawProperties) {
            return [];
        }

        for (const id of this._indexMap[expressID]) {
            const entity = objectRawProperties[id];
            if (entity == null) {
                continue;
            }
            const { name } = IfcPropertiesUtils.getEntityName(objectRawProperties, id);
            if (name === null) {
                continue;
            }

            if (entity.type === IFCPROPERTYSET) {
                const psetPropsIds = IfcPropertiesUtils.getPsetProps(objectRawProperties, id);
                if (psetPropsIds !== null) {
                    for (const psetPropId of psetPropsIds) {
                        const psetProp = objectRawProperties[psetPropId];
                        if (psetProp == null) {
                            continue;
                        }
                        const psetProperties = this.getProperty(psetPropId);
                        if (psetProperties === null) {
                            continue;
                        }
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
                        if (key === null) {
                            continue;
                        }
                        const qsetProperties = this.getProperty(quantityId);
                        if (qsetProperties === null) {
                            continue;
                        }
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
        const systems = this._fragmentClassifier.get();
        const groups: ClassificationItem[] = [];
        const currentSystemName = groupSystemNames[0]; // storeys
        const systemGroups = systems[currentSystemName];

        if (currentSystemName == null || systemGroups == null) {
            return groups;
        }
        for (const name of Object.keys(systemGroups)) {
            // name is N00, N01, N02...
            // { storeys: "N00" }, { storeys: "N01" }...
            const filter = { ...result, [currentSystemName]: [name] };
            const found = (await this._fragmentClassifier.find(filter)) as FragmentIdMap;
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

    protected async initClassification(): Promise<void> {
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
        this._fragmentBoundingBox = await this._components.tools.get(FragmentBoundingBox);
    }

    getClassification(): ClassificationItem[] {
        if (this._classificationCache === null) {
            throw new Error('Must call initClassification before getClassification');
        }
        return this._classificationCache;
    }

    private addHighlightToFragment(name: FragmentTypeName, fragment: Fragment) {
        if (!(name in fragment.fragments)) {
            const subFragment = fragment.addFragment(name, [materials[name]]);
            if (fragment.blocks.count > 1) {
                subFragment.setInstance(0, {
                    ids: Array.from(fragment.ids),
                    transform: tempMatrix,
                });
                subFragment.blocks.setVisibility(false);
            }

            this._model.add(subFragment.mesh);

            subFragment.mesh.renderOrder = 30;
            subFragment.mesh.frustumCulled = false;
            subFragment.mesh.name = name;
            subFragment.mesh.updateMatrixWorld(true);
        }
    }

    clearHighlight(name: FragmentTypeName = 'selection') {
        for (const fragID of Object.keys(this._ifcSelection[name])) {
            const fragment = this._fragmentManager.list[fragID];
            const selection = fragment?.fragments[name];
            if (selection != null) {
                selection.mesh.removeFromParent();
            }
        }
        this.notifyChange(this);

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
        const fragment = this._fragmentManager.list[fragmentID];
        if (fragment == null) {
            return;
        }
        const selection = fragment.fragments[name];
        if (selection == null) {
            return;
        }

        const fragmentParent = fragment.mesh.parent;
        if (fragmentParent == null) {
            return;
        }
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
                const fragment = this._fragmentManager.list[fragID];

                if (!(fragID in this._ifcSelection[name])) {
                    this._ifcSelection[name][fragID] = new Set<string>();
                }
                this._ifcSelection[name][fragID].add(itemId);
                this.addComposites(name, fragment.mesh, idNum);
                this.regenerate(name, fragID);
            }
        }
        this.notifyChange(this);
    }

    highlightById(ids: FragmentIdMap, name: FragmentTypeName = 'selection') {
        for (const fragID of Object.keys(ids)) {
            if (!(fragID in this._ifcSelection[name])) {
                this._ifcSelection[name][fragID] = new Set<string>();
            }

            const fragment = this._fragmentManager.list[fragID];

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

        this.notifyChange(this);
    }

    getBoundingBoxById(ids: FragmentIdMap) {
        this.clearHighlight('bbox');
        this.highlightById(ids, 'bbox');

        const bbox = this._fragmentBoundingBox;
        if (bbox === null) {
            throw new Error('Must call initClassification before getBoundingBoxById');
        }

        const fragments = this._fragmentManager;
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

        box.translate(this._model.position);

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
        if (mesh.fragment != null && pickedResult.instanceId != null && pickedResult.face) {
            const blockId = mesh.fragment.getVertexBlockID(mesh.geometry, pickedResult.face.a);

            const itemId = mesh.fragment
                .getItemID(pickedResult.instanceId, blockId)
                ?.replace(/\..*/, '');

            // @ts-expect-error IfcProperties defines indexes as numbers, but actually are strings
            if (itemId && mesh.fragment.group?.properties?.[itemId] != null) {
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
