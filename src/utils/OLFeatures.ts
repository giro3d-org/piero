import IgnProvider from '@/providers/IgnProvider';
import Coordinates from '@giro3d/giro3d/core/geographic/Coordinates';
import GeometryConverter, {
    PolygonOptions,
} from '@giro3d/giro3d/renderer/geometries/GeometryConverter';
import { getCenter } from 'ol/extent';
import type Feature from 'ol/Feature';
import { type FeatureLike } from 'ol/Feature';
import type FeatureFormat from 'ol/format/Feature';
import {
    LineString,
    type MultiLineString,
    type MultiPoint,
    type MultiPolygon,
    type Point,
    type Polygon,
} from 'ol/geom';
import { Group } from 'three';
import Projections from './Projections';

export type SimpleGeometryType =
    | 'Point'
    | 'MultiPoint'
    | 'LineString'
    | 'MultiLineString'
    | 'Polygon'
    | 'MultiPolygon';

export type SimpleGeometry =
    | Point
    | MultiPoint
    | LineString
    | MultiLineString
    | Polygon
    | MultiPolygon;

export type SimpleFeature = Feature<SimpleGeometry>;

/**
 * Converts data into OpenLayers features
 *
 * @param data - Data
 * @param format - OpenLayers format
 * @param dataProjection - Projection used in the data (by default EPSG:4326)
 * @param featureProjection - Output projection (typically the one used by Giro3D instance)
 * @returns Features
 */
async function readFeatures(
    data: string,
    format: FeatureFormat,
    dataProjection: string | undefined,
    featureProjection: string,
): Promise<FeatureLike[]> {
    const projIn = await Projections.loadProjCrsIfNeeded(dataProjection ?? 'EPSG:4326');

    return format.readFeatures(data, {
        dataProjection: projIn,
        featureProjection,
    });
}

/**
 * Filters features read by {@link readFeatures} into {@link SimpleFeature} usable by `OlFeature2Mesh`.
 * Unsupported features are simply ignored and filtered-out.
 *
 * @param features - Features
 * @returns Simple features
 */
function toSimpleFeatures(features: FeatureLike[]): SimpleFeature[] {
    return features.filter(feature => {
        if ('getType' in feature) {
            // Render feature, ignore
            return false;
        }
        const geomType = feature.getGeometry()?.getType();
        if (
            geomType == null ||
            ![
                'Point',
                'MultiPoint',
                'LineString',
                'MultiLineString',
                'Polygon',
                'MultiPolygon',
            ].includes(geomType)
        ) {
            return false;
        }

        return true;
    }) as SimpleFeature[];
}

/**
 * Converts data into OpenLayers features
 *
 * @param data - Data
 * @param format - OpenLayers format
 * @param dataProjection - Projection used in the data (by default EPSG:4326)
 * @param featureProjection - Output projection (typically the one used by Giro3D instance)
 * @returns Features
 */
async function readSimpleFeatures(
    data: string,
    format: FeatureFormat,
    dataProjection: string,
    featureProjection: string,
): Promise<SimpleFeature[]> {
    return toSimpleFeatures(
        format.readFeatures(data, {
            dataProjection,
            featureProjection,
        }),
    );
}

async function fillZCoordinates(
    features: SimpleFeature[],
    featureProjection: string,
    offset = 0.0,
    noDataValue = 0,
    fast = true,
): Promise<void> {
    const promises = [];
    const altitudes = new Map<number, Coordinates[]>();
    for (const feature of features) {
        const geom = feature.getGeometry();
        const geomType = geom?.getType();
        if (geom == null || geomType == null) {
            continue;
        }

        const coordinates = geom.getFlatCoordinates();
        const giroCoordinates = [];
        const stride = geom.getStride();
        if (stride >= 3 && coordinates[2] != null && coordinates[2] !== noDataValue) {
            // Feature already has altitude, skip
            continue;
        }

        if (fast) {
            const extent = geom.getExtent();
            const center = getCenter(extent);
            giroCoordinates.push(new Coordinates(featureProjection, center[0], center[1], 0));
        } else {
            for (let i = 0; i < coordinates.length; i += stride) {
                giroCoordinates.push(
                    new Coordinates(
                        featureProjection,
                        coordinates[i + 0],
                        coordinates[i + 1],
                        stride >= 3 ? coordinates[i + 2] : 0,
                    ),
                );
            }
        }
        promises.push(IgnProvider.alticode(giroCoordinates));
        // @ts-expect-error ol_uid is hidden
        altitudes.set(feature.ol_uid, giroCoordinates);
    }

    await Promise.allSettled(promises);

    for (const feature of features) {
        // @ts-expect-error ol_uid is hidden
        const giroCoordinates = altitudes.get(feature.ol_uid);
        const geom = feature.getGeometry();
        if (geom == null || giroCoordinates == null) continue;

        switch (geom.getType()) {
            case 'Point': {
                const g = geom as Point;
                const c = g.getCoordinates();
                c[2] = giroCoordinates[0].values[2] + offset;
                g.setCoordinates(c);
                break;
            }
            case 'MultiPoint':
            case 'LineString': {
                const g = geom as MultiPoint | LineString;
                const c = g.getCoordinates();
                for (let i = 0; i < c.length; i += 1) {
                    c[i][2] =
                        (fast ? giroCoordinates[0].values[2] : giroCoordinates[i].values[2]) +
                        offset;
                }
                g.setCoordinates(c);
                break;
            }
            case 'MultiLineString':
            case 'Polygon': {
                const g = geom as MultiLineString | Polygon;
                const c = g.getCoordinates();
                let k = 0;
                for (let i = 0; i < c.length; i += 1) {
                    for (let j = 0; j < c[i].length; j += 1) {
                        c[i][j][2] =
                            (fast ? giroCoordinates[0].values[2] : giroCoordinates[k].values[2]) +
                            offset;
                        k += 1;
                    }
                }
                g.setCoordinates(c);
                break;
            }
            case 'MultiPolygon': {
                const g = geom as MultiPolygon;
                const c = g.getCoordinates();
                let k = 0;
                for (let i = 0; i < c.length; i += 1) {
                    for (let j = 0; j < c[i].length; j += 1) {
                        for (let m = 0; m < c[i][j].length; m += 1) {
                            c[i][j][m][2] =
                                (fast
                                    ? giroCoordinates[0].values[2]
                                    : giroCoordinates[k].values[2]) + offset;
                            k += 1;
                        }
                    }
                }
                g.setCoordinates(c);
                break;
            }
            default:
            // do nothing
        }
    }
}

/**
 * Converts a list of features into Threejs meshes.
 * Meshes are automatically translated around their center to avoid weird side-effects.
 *
 * @param olFeatures - Features to convert
 * @param polygonOptions - Options to pass to the geometry converter.
 * @returns Group of meshes
 */
function toMeshes(olFeatures: SimpleFeature[], polygonOptions?: PolygonOptions): Group {
    const root = new Group();

    const converter = new GeometryConverter();

    const meshes = olFeatures.map(f => {
        const geometry = f.getGeometry();

        if (geometry != null) {
            const type = geometry.getType() as SimpleGeometryType;
            let mesh;

            switch (type) {
                case 'Point':
                    mesh = converter.build(geometry as Point);
                    break;
                case 'LineString':
                    mesh = converter.build(geometry as LineString);
                    break;
                case 'Polygon':
                    mesh = converter.build(geometry as Polygon, polygonOptions);
                    break;
                case 'MultiPoint':
                    mesh = converter.build(geometry as MultiPoint);
                    break;
                case 'MultiLineString':
                    mesh = converter.build(geometry as MultiLineString);
                    break;
                case 'MultiPolygon':
                    mesh = converter.build(geometry as MultiPolygon, polygonOptions);
                    break;
                default:
                    mesh = null;
            }

            if (mesh) {
                for (const [name, value] of Object.entries(f.getProperties())) {
                    if (name !== 'geometry') {
                        mesh.userData[name] = value;
                    }
                }
            }
            return mesh;
        }
    });

    for (const mesh of meshes) {
        if (mesh != null) {
            root.add(mesh);
        }
    }

    return root;
}

export default { readFeatures, readSimpleFeatures, toSimpleFeatures, fillZCoordinates, toMeshes };
