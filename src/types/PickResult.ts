import { Drawing } from "@giro3d/giro3d/interactions";
import { Face, Object3D, Vector3 } from "three";
import OLFeature from 'ol/Feature';
import { FragmentMesh } from 'bim-fragment/fragment-mesh';
import { Coordinates } from "@giro3d/giro3d/core/geographic";

/**
 * Picked object
 */
interface PickResult {
    point: Vector3;
    coord?: Coordinates;
    layer?: any;
    rootobj?: Object3D;
    object?: Object3D;
    drawing?: Drawing;
    distance?: number;
    distanceToRay?: number;
    index?: number;
    face?: Face;
    faceIndex?: number;
    feature?: OLFeature;

    // IFC
    mesh?: FragmentMesh;
    blockId?: number;
    itemId?: string;
}

export default PickResult;
