import type Shape from '@giro3d/giro3d/entities/Shape';
import type { ColorRepresentation } from 'three';

import { EventDispatcher, MathUtils } from 'three';

import Download from '@/utils/Download';

type AnnotationEventMap = {
    isEditing: EmptyEvent;
    visible: EmptyEvent;
};

type EmptyEvent = {
    /** empty */
};

export type PieroShapeUserData = {
    annotation?: Annotation;
    highlightable: boolean;
    highlightColor: ColorRepresentation;
    measurements: {
        area?: number | null;
        minmax: [number, number];
        perimeter?: number | null;
    };
    type: 'LineString' | 'MultiPoint' | 'Point' | 'Polygon';
};

export default class Annotation extends EventDispatcher<AnnotationEventMap> {
    public properties: object;
    public readonly title: string;
    public readonly uuid: string;
    public get isEditing(): boolean {
        return this._isEditing;
    }
    public set isEditing(v: boolean) {
        this._isEditing = v;
        this.dispatchEvent({ type: 'isEditing' });
    }
    public get object(): Shape<PieroShapeUserData> {
        return this._object();
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(v: boolean) {
        this._visible = v;
        this.dispatchEvent({ type: 'visible' });
    }

    private _isEditing: boolean;

    private _object: () => Shape<PieroShapeUserData>;

    private _visible: boolean;

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

    public static toCollection(annotations: Annotation[]): GeoJSON.FeatureCollection {
        const features = annotations.map(annotation => annotation.toGeoJSON());

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
                title: 'Giro3D annotations',
                updated: new Date().toISOString(),
            },
        };
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
}
