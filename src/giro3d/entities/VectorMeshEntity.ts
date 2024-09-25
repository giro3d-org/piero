import FeatureFormat from 'ol/format/Feature';
import GeoJSONFormat from 'ol/format/GeoJSON';
import GPXFormat from 'ol/format/GPX';
import KMLFormat from 'ol/format/KML';
import { Group } from 'three';
import Entity3D from '@giro3d/giro3d/entities/Entity3D';
import type { PolygonOptions } from '@giro3d/giro3d/renderer/geometries/GeometryConverter';
import { DEFAULT_LINE_COLOR, DEFAULT_SURFACE_COLOR } from '@giro3d/giro3d/core/FeatureTypes';

import Fetcher, { type FetchContext } from '@/utils/Fetcher';
import OLFeatures, { type SimpleFeature } from '@/utils/OLFeatures';
import Projections from '@/utils/Projections';
import { fillObject3DUserData } from '@/loaders/userData';
import type {
    DataProjectionMixin,
    ElevationMixin,
    FeatureProjectionMixin,
    UrlOrDataMixin,
} from '../sources/mixins';

export interface VectorMeshSourceOptions
    extends UrlOrDataMixin,
        DataProjectionMixin,
        Required<FeatureProjectionMixin>,
        ElevationMixin {}

const geojsonFormat = new GeoJSONFormat();
const gpxFormat = new GPXFormat();
const kmlFormat = new KMLFormat();

/**
 * Converts a GeoJSON object into a list of GeoJSON features
 * @param json - GeoJSON object
 * @returns Array of GeoJSON features
 */
export function toGeoJSONFeatures(json: GeoJSON.GeoJSON): GeoJSON.Feature[] {
    switch (json.type) {
        case 'Feature':
            return [json];
        case 'FeatureCollection':
            return json.features;
        case 'GeometryCollection': {
            const features: GeoJSON.Feature[] = json.geometries.map(geometry => ({
                type: 'Feature',
                geometry,
                properties: {},
            }));
            return features;
        }
        default: {
            const feature: GeoJSON.Feature = {
                type: 'Feature',
                geometry: json,
                properties: {},
            };
            return [feature];
        }
    }
}

/**
 * Converts GeoJSON features into OpenLayers features.
 * Will handle reprojection if needed.
 * Will fetch elevation if `parameters.fetchElevation` is `true`.
 *
 * @param features - Array of GeoJSON features
 * @param parameters - Loader parameters
 * @returns Array of simple features, where unsupported features are discarded
 */
export async function geojsonToOlFeatures(
    features: GeoJSON.Feature[],
    parameters: VectorMeshSourceOptions,
): Promise<SimpleFeature[]> {
    const dataProjection = await Projections.loadProjCrsIfNeeded(
        parameters.dataProjection ?? 'EPSG:4326',
    );

    const olFeatures = features.flatMap(f =>
        geojsonFormat.readFeatures(f, {
            dataProjection,
            featureProjection: parameters.featureProjection,
        }),
    );
    const simpleFeatures = OLFeatures.toSimpleFeatures(olFeatures);

    if (parameters.fetchElevation ?? false) {
        await OLFeatures.fetchZCoordinates(
            simpleFeatures,
            parameters.featureProjection,
            0.1,
            0,
            parameters.fetchElevationFast ?? true,
        );
    }
    return simpleFeatures;
}

/**
 * Converts loaded data into OpenLayers {@link SimpleFeature}s.
 * Will handle reprojection if needed.
 * Will fetch elevation if `parameters.fetchElevation` is `true`.
 *
 * @param data - Loaded data
 * @param format - OpenLayers format used for decoding `data`
 * @param parameters - Loader parameters
 * @returns Array of simple features, where unsupported features are discarded
 */
export async function toOlFeatures(
    data: string,
    format: FeatureFormat,
    parameters: VectorMeshSourceOptions,
): Promise<SimpleFeature[]> {
    const olFeatures = await OLFeatures.readSimpleFeatures(
        data,
        format,
        parameters.dataProjection ?? 'EPSG:4326',
        parameters.featureProjection,
    );

    if (parameters.fetchElevation ?? false) {
        await OLFeatures.fetchZCoordinates(
            olFeatures,
            parameters.featureProjection,
            0.1,
            0,
            parameters.fetchElevationFast ?? true,
        );
    }
    return olFeatures;
}

/**
 * Converts {@link SimpleFeature}s into a Three.js `Group`.
 * Assumes features are already in the correct CRS.
 *
 * @param features - Features to convert
 * @param parameters - Loader parameters
 * @returns Group containing all meshes for all features
 */
export async function olFeaturestoGroup(
    features: SimpleFeature[],
    options?: PolygonOptions,
): Promise<Group> {
    const elevation =
        (Array.isArray(options?.elevation) ? options.elevation[0] : options?.elevation) ?? 0;
    OLFeatures.fillZCoordinates(features, elevation);
    return OLFeatures.toMeshes(features, options);
}

/** Interface to implement for a new source for {@link VectorMeshEntity} */
export interface VectorMeshSource {
    /** Elevation of the features */
    elevation?: number;
    /** Loads the features. Will be called only once */
    load(): Promise<SimpleFeature[]>;
    /** Context of the data */
    context(): FetchContext;
}

/** OpenLayers-based source */
export class OlMeshSource implements VectorMeshSource {
    elevation?: number;
    /** OL Feature format */
    readonly format: FeatureFormat;
    readonly options: VectorMeshSourceOptions;

    constructor(format: FeatureFormat, options: VectorMeshSourceOptions) {
        this.format = format;
        this.options = options;
        this.elevation = options.elevation;
    }

    async load(): Promise<SimpleFeature[]> {
        const text = await Fetcher.fetchText(this.options.url);
        const features = await toOlFeatures(text, this.format, this.options);
        return features;
    }

    context(): FetchContext {
        return Fetcher.getContext(this.options.url);
    }
}

/** GPX source */
export class GpxMeshSource extends OlMeshSource {
    constructor(options: VectorMeshSourceOptions) {
        super(gpxFormat, options);
    }
}

/** KML source */
export class KmlMeshSource extends OlMeshSource {
    constructor(options: VectorMeshSourceOptions) {
        super(kmlFormat, options);
    }
}

/** GeoJSON source */
export class GeoJsonMeshSource implements VectorMeshSource {
    elevation?: number;
    readonly options: VectorMeshSourceOptions;

    constructor(options: VectorMeshSourceOptions) {
        this.options = options;
        this.elevation = options.elevation;
    }

    async load(): Promise<SimpleFeature[]> {
        // First, get the data as GeoJSON
        const json = await Fetcher.fetchJson<GeoJSON.GeoJSON>(this.options.url);

        // Convert them into a list of GeoJSON features
        const features = toGeoJSONFeatures(json);

        // Convert them into OpenLayers features
        const olFeatures = await geojsonToOlFeatures(features, this.options);
        return olFeatures;
    }

    context(): FetchContext {
        return Fetcher.getContext(this.options.url);
    }
}

/** Entity for displaying vector data as meshes */
export default class VectorMeshEntity extends Entity3D {
    readonly sources: VectorMeshSource[];

    constructor(sources: VectorMeshSource | VectorMeshSource[]) {
        super(new Group());
        this.sources = Array.isArray(sources) ? sources : [sources];
    }

    protected async preprocess(): Promise<void> {
        for (const source of this.sources) {
            const olFeatures = await source.load();
            const group = await olFeaturestoGroup(olFeatures, {
                elevation: source.elevation,
                fill: { color: DEFAULT_SURFACE_COLOR },
                stroke: { color: DEFAULT_LINE_COLOR },
            });

            this.object3d.add(group);
            this.onObjectCreated(group);

            const context = source.context();
            fillObject3DUserData(group, { filename: context.filename });
        }
        this.notifyChange(this.object3d);
    }
}
