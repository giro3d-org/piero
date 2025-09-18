import type Shape from '@giro3d/giro3d/entities/Shape';
import type { ColorRepresentation } from 'three';

import { EventDispatcher, MathUtils } from 'three';

import Download from '@/utils/Download';

type EmptyEvent = {
    /** empty */
};

type AnnotationEventMap = {
    visible: EmptyEvent;
    isEditing: EmptyEvent;
};

export type PieroShapeUserData = {
    type: 'Point' | 'Polygon' | 'LineString' | 'MultiPoint';
    annotation?: Annotation;
    highlightable: boolean;
    highlightColor: ColorRepresentation;
    measurements: {
        area?: number | null;
        perimeter?: number | null;
        minmax: [number, number];
    };
};

export default class Annotation extends EventDispatcher<AnnotationEventMap> {
    public readonly uuid: string;
    public readonly title: string;
    private _visible: boolean;
    private _isEditing: boolean;
    private _object: () => Shape<PieroShapeUserData>;
    public properties: object;

    public constructor(
        title: string,
        object: () => Shape<PieroShapeUserData>,
        properties: object = {},
    ) {
        super();

        this.title = title;
        this._visible = true;
        this._isEditing = false;
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

    public get object(): Shape<PieroShapeUserData> {
        return this._object();
    }

    public get isEditing(): boolean {
        return this._isEditing;
    }

    public set isEditing(v: boolean) {
        this._isEditing = v;
        this.dispatchEvent({ type: 'isEditing' });
    }

    public toGeoJSON(): GeoJSON.Feature {
        const geojson = this.object.toGeoJSON({
            includeAltitudes: true,
        });

        geojson.id = `${Download.getBaseUrl()}#${this.uuid}`;
        geojson.properties = {
            ...geojson.properties,
            title: this.title,
            updated: new Date().toISOString(),
        };

        return geojson;
    }

    public static toCollection(annotations: Annotation[]): GeoJSON.FeatureCollection {
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
