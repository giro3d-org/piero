import { Drawing } from "@giro3d/giro3d/interactions";
import { Face, Object3D, Vector3 } from "three";
import OLFeature from 'ol/Feature';

/**
 * Picked object
 */
interface PickResult {
    point?: Vector3;
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
}

export default PickResult;