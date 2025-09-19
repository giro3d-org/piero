import type FeatureFormat from 'ol/format/Feature';

import type { VectorLabelOptions } from '@/giro3d/entities/VectorLabelsEntity';
import type { VectorMeshSourceOptions } from '@/giro3d/entities/VectorMeshEntity';
import type { GeopackageSourceParameters } from '@/giro3d/sources/GeopackageSource';
import type { ShapefileSourceParameters } from '@/giro3d/sources/ShapefileSource';

import type { DatasetConfigBase, DatasetSourceConfigBase } from './core';

export interface GeoJsonMeshSourceConfig
    extends DatasetSourceConfigBase<'geojson'>,
        Omit<VectorMeshSourceOptions, 'featureProjection'> {}

export interface GeopackageMeshSourceConfig
    extends DatasetSourceConfigBase<'geopackage'>,
        Omit<GeopackageSourceParameters, 'featureProjection'> {}

export interface GpxMeshSourceConfig
    extends DatasetSourceConfigBase<'gpx'>,
        Omit<VectorMeshSourceOptions, 'featureProjection'> {}

export interface KmlMeshSourceConfig
    extends DatasetSourceConfigBase<'kml'>,
        Omit<VectorMeshSourceOptions, 'featureProjection'> {}

export interface OlMeshSourceConfig
    extends DatasetSourceConfigBase<'ol'>,
        Omit<VectorMeshSourceOptions, 'featureProjection'> {
    format: FeatureFormat;
}

export interface ShapefileMeshSourceConfig
    extends DatasetSourceConfigBase<'shapefile'>,
        Omit<ShapefileSourceParameters, 'featureProjection'> {}

export type VectorDatasetConfig =
    | VectorLabelsDatasetConfig
    | VectorMeshDatasetConfig
    | VectorShapeDatasetConfig;

export type VectorDatasetRendering = NonNullable<VectorDatasetConfig['rendering']>;

export interface VectorLabelsDatasetConfig extends DatasetConfigBase<'vector'>, VectorLabelOptions {
    rendering: 'label';
    source: VectorMeshDatasetSourceConfig | VectorMeshDatasetSourceConfig[];
}

export interface VectorMeshDatasetConfig extends DatasetConfigBase<'vector'> {
    rendering?: 'mesh';
    source: VectorMeshDatasetSourceConfig | VectorMeshDatasetSourceConfig[];
}

export type VectorMeshDatasetSourceConfig =
    | GeoJsonMeshSourceConfig
    | GeopackageMeshSourceConfig
    | GpxMeshSourceConfig
    | KmlMeshSourceConfig
    | OlMeshSourceConfig
    | ShapefileMeshSourceConfig;

export interface VectorShapeDatasetConfig extends DatasetConfigBase<'vector'> {
    rendering: 'shape';
    source: VectorMeshDatasetSourceConfig;
}
