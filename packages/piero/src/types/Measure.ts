import type Measure3D from '@/giro3d/Measure3D';
import Download from '@/utils/Download';
import { EventDispatcher, MathUtils } from 'three';

type MeasureEventMap = {
    visible: {
        /** empty */
    };
};

export default class Measure extends EventDispatcher<MeasureEventMap> {
    readonly uuid: string;
    readonly title: string;
    private _visible: boolean;
    private _object: Measure3D;
    properties: object;

    constructor(title: string, object: Measure3D, properties: object = {}) {
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
        const geojson = {
            type: 'Feature',
            id: `${Download.getBaseUrl()}#${this.uuid}`,
            geometry: {
                type: 'LineString',
                coordinates: [this.object.from.toArray(), this.object.to.toArray()],
            },
            properties: {
                ...this.properties,
                title: this.title,
                updated: new Date().toISOString(),
            },
        } as GeoJSON.Feature;

        return geojson;
    }

    static toCollection(measures: Measure[]): GeoJSON.FeatureCollection {
        const features = measures.map(measure => measure.toGeoJSON());

        return {
            type: 'FeatureCollection',
            features,
            // @ts-expect-error GeoJSON spec does not allow properties on FeatureCollection
            // But OWC requires it Oo
            id: `${Download.getBaseUrl()}#${MathUtils.generateUUID()}`,
            properties: {
                lang: 'en',
                title: 'Giro3D measures',
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
