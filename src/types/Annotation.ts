import Download from "@/utils/Download";
import Drawing from "@giro3d/giro3d/interactions/Drawing";
import { EventDispatcher, MathUtils } from "three";

type AnnotationEventMap = {
    visible: {},
};

export default class Annotation extends EventDispatcher<AnnotationEventMap> {
    readonly uuid: string;
    readonly title: string;
    private _visible: boolean;
    private _object: Drawing;
    properties: any;

    constructor(title: string, object: Drawing, properties: any = {}) {
        super();

        this.title = title;
        this._visible = true;
        this._object = object;
        this.properties = properties;
        this.uuid = MathUtils.generateUUID();
    }

    get visible() {
        return this._visible;
    }

    set visible(v) {
        this._visible = v;
        this.dispatchEvent({ type: 'visible' });
    }

    get object() {
        return this._object;
    }

    set object(obj) {
        this._object = obj;
    }

    toGeoJSON() {
        const coords = [];
        const objectFlatCoords = this.object.coordinates;
        for (let i=0; i < objectFlatCoords.length; i += 3) {
            coords.push([
                objectFlatCoords[i],
                objectFlatCoords[i+1],
                objectFlatCoords[i+2],
            ]);
        }
        let coordinates;
        switch (this.object.geometryType) {
            case 'Point':
                coordinates = coords[0];
                break;
            case 'LineString':
            case 'MultiPoint':
                coordinates = coords;
                break;
            case 'Polygon':
            default:
                {
                    // Polygon is always closed
                    const outerRing = coords;
                    coordinates = [outerRing];
                }
                break;
        }
        const geojson = {
            type: 'Feature',
            id: `${Download.getBaseUrl()}/#${this.uuid}`,
            geometry: {
                type: this.object.geometryType,
                coordinates,
            },
            properties: {
                ...this.properties,
                title: this.title,
                updated: new Date().toISOString(),
            }
        } as GeoJSON.Feature;

        return geojson;
    }
}
