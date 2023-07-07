import {
    Vector2, Plane, Vector3, Ray,
} from 'three';

const tmpGetClosestPointOnBox = {
    planes: [
        new Plane(),
        new Plane(),
        new Plane(),
        new Plane(),
        new Plane(),
        new Plane(),
    ],
    normals: [
        new Vector3(1, 0, 0), // xmin
        new Vector3(0, 1, 0), // ymin
        new Vector3(0, 0, 1), // zmin
        new Vector3(1, 0, 0), // xmax
        new Vector3(0, 1, 0), // ymax
        new Vector3(0, 0, 1), // zmax
    ],
    vec3: new Vector3(),
    ray: new Ray(),
    intersection: undefined,
};
const tmpCoords = new Vector2();

class Picking {
    constructor(instance, layerManager) {
        this.instance = instance;
        this.layerManager = layerManager;
    }

    getPointAt(mouseOrEvt, options = {}) {
        const mouse = mouseOrEvt instanceof Event
            ? this.instance.eventToCanvasCoords(mouseOrEvt, tmpCoords)
            : mouseOrEvt;
        const radius = options.radius ?? 1;
        const limit = options.limit ?? Infinity;
        const where = options.where ?? null;
        const fallback = options.fallback ?? true;

        console.time('picking');
        const picked = this.instance.pickObjectsAt(mouse, {
            radius,
            where,
            limit,
            filter: p => (
                // Make sure we pick a valid point
                Number.isFinite(p.point.x)
                && Number.isFinite(p.point.y)
                && Number.isFinite(p.point.z)
            ),
        }).sort((a, b) => (a.distance - b.distance)).at(0);
        console.timeEnd('picking');

        if (picked) {
            return { ...picked, picked: true };
        }

        if (fallback) {
            console.time('closest-picking');
            const bbox = this.layerManager.getBoundingBox();
            const closest = this.getClosestPointOnBox(mouse, bbox);
            console.timeEnd('closest-picking');
            if (closest) {
                return { point: closest.point, picked: false, planeIdx: closest.planeIdx };
            }
        }

        return undefined;
    }

    getClosestPointOnBox(mouse, bbox) {
        // Create our plans based on the bounding box
        // (basically extend each side so it covers the whole world)
        tmpGetClosestPointOnBox.normals[2].setZ(Math.sign(bbox.min.z));
        tmpGetClosestPointOnBox.normals[5].setZ(Math.sign(bbox.max.z));

        for (let i = 0; i < 6; i += 1) {
            tmpGetClosestPointOnBox.planes[i].set(tmpGetClosestPointOnBox.normals[i], 0);
        }
        for (let i = 0; i < 3; i += 1) {
            tmpGetClosestPointOnBox.planes[i].translate(bbox.min);
            tmpGetClosestPointOnBox.planes[i + 3].translate(bbox.max);
        }

        // Now found out where we'd sit if we project our cursor
        // onto each plane, and take the closest point to the bbox
        const ndc = this.instance.canvasToNormalizedCoords(mouse, tmpCoords);
        tmpGetClosestPointOnBox.vec3
            .set(ndc.x, ndc.y, 0.5)
            .unproject(this.instance.camera.camera3D)
            .sub(this.instance.camera.camera3D.position)
            .normalize();
        tmpGetClosestPointOnBox.ray.set(
            this.instance.camera.camera3D.position, tmpGetClosestPointOnBox.vec3,
        );

        tmpGetClosestPointOnBox.intersection = undefined;
        for (let i = 0; i < 6; i += 1) {
            const projected = tmpGetClosestPointOnBox.ray.intersectPlane(
                tmpGetClosestPointOnBox.planes[i],
                tmpGetClosestPointOnBox.vec3,
            );
            if (projected) {
                // Projection intersects the plane, compute the
                // distance between the bbox and the point
                // Note: not having an intersection is not a sign of misbehavior:
                // this happens for instance if we're viewing from top or a side
                const dist = bbox.distanceToPoint(projected);
                if (!tmpGetClosestPointOnBox.intersection
                    || tmpGetClosestPointOnBox.intersection.distance > dist) {
                    tmpGetClosestPointOnBox.intersection = {
                        point: projected.clone(),
                        distance: dist,
                        planeIdx: i,
                        plane: tmpGetClosestPointOnBox.planes[i],
                    };
                }
            }
        }

        // Return the closest point
        return tmpGetClosestPointOnBox.intersection;
    }
}

export default Picking;
