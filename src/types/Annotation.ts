import Download from '@/utils/Download';
import Drawing from '@giro3d/giro3d/interactions/Drawing';
import { EventDispatcher, MathUtils } from 'three';

type AnnotationEventMap = {
    visible: {
        /** empty */
    };
};

export default class Annotation extends EventDispatcher<AnnotationEventMap> {
    readonly uuid: string;
    readonly title: string;
    private _visible: boolean;
    private _object: Drawing;
    properties: object;

    constructor(title: string, object: Drawing, properties: object = {}) {
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
        const coords: GeoJSON.Position[] = [];
        const objectFlatCoords = this.object.coordinates;
        for (let i = 0; i < objectFlatCoords.length; i += 3) {
            coords.push([objectFlatCoords[i], objectFlatCoords[i + 1], objectFlatCoords[i + 2]]);
        }
        let geometry;
        switch (this.object.geometryType) {
            case 'Point':
                geometry = {
                    type: this.object.geometryType,
                    coordinates: coords[0],
                };
                break;
            case 'LineString':
            case 'MultiPoint':
                geometry = {
                    type: this.object.geometryType,
                    coordinates: coords,
                };
                break;
            case 'Polygon':
                geometry = {
                    type: this.object.geometryType,
                    coordinates: [coords],
                };
                break;
            default:
                throw new Error(`Unsupported type ${this.object.geometryType}`);
        }
        const geojson: GeoJSON.Feature = {
            type: 'Feature',
            id: `${Download.getBaseUrl()}#${this.uuid}`,
            geometry,
            properties: {
                ...this.properties,
                title: this.title,
                updated: new Date().toISOString(),
            },
        };

        return geojson;
    }

    static toCollection(annotations: Annotation[]): GeoJSON.FeatureCollection {
        const features = annotations.map(annotation => annotation.toGeoJSON());

        return {
            type: 'FeatureCollection',
            features,
            // @ts-expect-error GeoJSON spec does not allow properties on FeatureCollection
            // But OWC requires it Oo
            id: `${Download.getBaseUrl()}#${MathUtils.generateUUID()}`,
            properties: {
                lang: 'en',
                title: 'Giro3D annotations',
                updated: new Date().toISOString(),
                creator: 'Giro3D',
                generator: {
                    title: 'Giro3D',
                    uri: Download.getBaseUrl(),
                },
                links: [
                    {
                        rel: 'profile',
                        href: 'http://www.opengis.net/spec/owc-atom/1.0/req/core',
                        title: 'This file is compliant with version 1.0 of OGC Context',
                    },
                ],
            },
        };
    }
}
