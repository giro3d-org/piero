import Download from '@/utils/Download';
import type Shape from '@giro3d/giro3d/entities/Shape';
import type { GeoJsonProperties } from 'geojson';
import { ColorRepresentation, EventDispatcher, MathUtils } from 'three';

type EmptyEvent = {
    /** empty */
};

type AnnotationEventMap = {
    visible: EmptyEvent;
    isEditing: EmptyEvent;
};

export type PieroShapeUserData = {
    type: 'Point' | 'Polygon' | 'LineString' | 'MultiPoint';
    annotation: Annotation;
    highlightable: boolean;
    highlightColor: ColorRepresentation;
    measurements: {
        area?: number | null;
        perimeter?: number | null;
        minmax: [number, number];
    };
};

export default class Annotation extends EventDispatcher<AnnotationEventMap> {
    readonly uuid: string;
    readonly title: string;
    private _visible: boolean;
    private _isEditing: boolean;
    private _object: () => Shape<PieroShapeUserData>;
    properties: NonNullable<GeoJsonProperties>;

    constructor(
        title: string,
        object: () => Shape<PieroShapeUserData>,
        properties: NonNullable<GeoJsonProperties> = {},
    ) {
        super();

        this.title = title;
        this._visible = true;
        this._isEditing = false;
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
        return this._object();
    }

    get isEditing() {
        return this._isEditing;
    }

    set isEditing(v) {
        this._isEditing = v;
        this.dispatchEvent({ type: 'isEditing' });
    }

    toGeoJSON() {
        const now = new Date();
        const geojson = this.object.toGeoJSON({
            includeAltitudes: true,
        });

        geojson.id = `${Download.getBaseUrl()}#${this.uuid}`;
        geojson.properties = {
            updated: now.toISOString(), // Let dates be overriden by properties
            created: now.toISOString(),
            ...geojson.properties, // empty for now
            ...this.properties,
            title: this.title,
        };

        return geojson;
    }

    static toCollection(annotations: Annotation[]): GeoJSON.FeatureCollection {
        const features = annotations.map(annotation => annotation.toGeoJSON());
        const now = new Date();

        return {
            type: 'FeatureCollection',
            features,
            // @ts-expect-error GeoJSON spec does not allow properties on FeatureCollection
            // But OWC requires it Oo
            id: `${Download.getBaseUrl()}#${MathUtils.generateUUID()}`,
            properties: {
                lang: 'en',
                title: 'Giro3D annotations',
                updated: now.toISOString(),
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
