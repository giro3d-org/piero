import { EventDispatcher, MathUtils } from 'three';

import type Measure3D from '@/giro3d/Measure3D';

import Download from '@/utils/Download';

type MeasureEventMap = {
    visible: {
        /** empty */
    };
};

export default class Measure extends EventDispatcher<MeasureEventMap> {
    public readonly uuid: string;
    public readonly title: string;
    private _visible: boolean;
    private _object: Measure3D;
    public properties: object;

    public constructor(title: string, object: Measure3D, properties: object = {}) {
        super();

        this.title = title;
        this._visible = true;
        this._object = object;
        this.properties = properties;
        this.uuid = MathUtils.generateUUID();
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(v: boolean) {
        this._visible = v;
        this.dispatchEvent({ type: 'visible' });
    }

    public get object(): Measure3D {
        return this._object;
    }

    public set object(obj: Measure3D) {
        this._object = obj;
    }

    public toGeoJSON(): GeoJSON.Feature {
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

    public static toCollection(measures: Measure[]): GeoJSON.FeatureCollection {
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
