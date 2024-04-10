import type Feature from 'ol/Feature';
import { type FeatureLike } from 'ol/Feature';
import type FeatureFormat from 'ol/format/Feature';
import {
    type LineString,
    type MultiLineString,
    type MultiPoint,
    type MultiPolygon,
    type Point,
    type Polygon,
} from 'ol/geom';
import { Box3, Group, Vector3 } from 'three';
import OlFeature2Mesh, { type OlFeature2MeshOptions } from '@giro3d/giro3d/utils/OlFeature2Mesh';

import Projections from './Projections';

export type SimpleFeature = Feature<
    Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon
>;

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
    dataProjection: string,
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

/**
 * Converts a list of features into Threejs meshes.
 * Meshes are automatically translated around their center to avoid weird side-effects.
 *
 * @param olFeatures - Features to convert
 * @param options - Options to pass to `OlFeature2Mesh`
 * @returns Group of meshes
 */
function toMeshes(olFeatures: SimpleFeature[], options?: OlFeature2MeshOptions): Group {
    const root = new Group();

    const meshes = OlFeature2Mesh.convert(olFeatures, options ?? null);
    const bbox = new Box3();
    const center = new Vector3();
    for (const mesh of meshes) {
        bbox.setFromObject(mesh);
        bbox.getCenter(center);

        mesh.geometry.translate(-center.x, -center.y, -center.z);
        mesh.position.copy(center);
        mesh.updateMatrix();
        mesh.updateMatrixWorld();
        root.add(mesh);
    }

    return root;
}

export default { readFeatures, readSimpleFeatures, toSimpleFeatures, toMeshes };
