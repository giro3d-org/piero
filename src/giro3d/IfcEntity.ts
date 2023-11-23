import { Entity3D } from "@giro3d/giro3d/entities";
import { Fragment } from "bim-fragment/fragment";
import { FragmentsGroup } from 'bim-fragment/fragments-group';
import { FragmentMesh } from 'bim-fragment/fragment-mesh';
import { Components, FragmentManager, FragmentIdMap, toCompositeID, SimpleRaycaster } from 'openbim-components';
import { Matrix4, MeshBasicMaterial, Vector3 } from "three";

export type RaycastResult = {
    mesh: FragmentMesh,
    blockId: number,
    itemId: string,
};

const highlightMaterial = new MeshBasicMaterial({
    color: "#FF0000",
    transparent: true,
    opacity: 0.6,
    depthTest: true,
});
const tempMatrix = new Matrix4();
const selectionFragmentName = "selection";


export default class IfcEntity extends Entity3D {
    readonly isIfcEntity = true;
    readonly components: Components;
    readonly fragmentManager: FragmentManager;
    private ifcSelection: FragmentIdMap;

    constructor(root: FragmentsGroup, components: Components, fragmentManager: FragmentManager) {
        super(root.uuid, root);

        this.components = components;
        this.fragmentManager = fragmentManager;
        this.type = 'IfcEntity';
        this.ifcSelection = {};
        this.initializeIfcHightlight();
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
        const idNum = parseInt(itemId, 10);

        const fragList: Fragment[] = [];
        this.ifcSelection[mesh.uuid] = new Set<string>();

        fragList.push(mesh.fragment);

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
                fragList.push(fragment);
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

    raycast(origin: Vector3, direction: Vector3): RaycastResult | null {
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
