import { EventDispatcher, MathUtils } from 'three';

import type Measure3D from '@/giro3d/Measure3D';

import Download from '@/utils/Download';

type MeasureEventMap = {
    visible: {
        /** empty */
    };
};

export default class Measure extends EventDispatcher<MeasureEventMap> {
    public properties: object;
    public readonly title: string;
    public readonly uuid: string;
    public get object(): Measure3D {
        return this._object;
    }
    public set object(obj: Measure3D) {
        this._object = obj;
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(v: boolean) {
        this._visible = v;
        this.dispatchEvent({ type: 'visible' });
    }

    private _object: Measure3D;

    private _visible: boolean;

    public constructor(title: string, object: Measure3D, properties: object = {}) {
        super();

        this.title = title;
        this._visible = true;
        this._object = object;
        this.properties = properties;
        this.uuid = MathUtils.generateUUID();
    }

    public static toCollection(measures: Measure[]): GeoJSON.FeatureCollection {
        const features = measures.map(measure => measure.toGeoJSON());

        return {
            features,
            type: 'FeatureCollection',
            // @ts-expect-error GeoJSON spec does not allow properties on FeatureCollection
            // But OWC requires it Oo
            id: `${Download.getBaseUrl()}#${MathUtils.generateUUID()}`,
            properties: {
                creator: 'Giro3D',
                generator: {
                    title: 'Giro3D',
                    uri: Download.getBaseUrl(),
                },
                lang: 'en',
                links: [
                    {
                        href: 'http://www.opengis.net/spec/owc-atom/1.0/req/core',
                        rel: 'profile',
                        title: 'This file is compliant with version 1.0 of OGC Context',
                    },
                ],
                title: 'Giro3D measures',
                updated: new Date().toISOString(),
            },
        };
    }

    public toGeoJSON(): GeoJSON.Feature {
        const geojson = {
            geometry: {
                coordinates: [this.object.from.toArray(), this.object.to.toArray()],
                type: 'LineString',
            },
            id: `${Download.getBaseUrl()}#${this.uuid}`,
            properties: {
                ...this.properties,
                title: this.title,
                updated: new Date().toISOString(),
            },
            type: 'Feature',
        } as GeoJSON.Feature;

        return geojson;
    }
}
