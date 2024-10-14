import type { VectorLabelOptions } from '@/giro3d/entities/VectorLabelsEntity';
import type { VectorMeshSourceOptions } from '@/giro3d/entities/VectorMeshEntity';
import type { GeopackageSourceParameters } from '@/giro3d/sources/GeopackageSource';
import type { ShapefileSourceParameters } from '@/giro3d/sources/ShapefileSource';
import type FeatureFormat from 'ol/format/Feature';
import type { DatasetConfigBase, DatasetSourceConfigBase } from './core';

export interface OlMeshSourceConfig
    extends DatasetSourceConfigBase<'ol'>,
        Omit<VectorMeshSourceOptions, 'featureProjection'> {
    format: FeatureFormat;
}

export interface GpxMeshSourceConfig
    extends DatasetSourceConfigBase<'gpx'>,
        Omit<VectorMeshSourceOptions, 'featureProjection'> {}

export interface KmlMeshSourceConfig
    extends DatasetSourceConfigBase<'kml'>,
        Omit<VectorMeshSourceOptions, 'featureProjection'> {}

export interface GeoJsonMeshSourceConfig
    extends DatasetSourceConfigBase<'geojson'>,
        Omit<VectorMeshSourceOptions, 'featureProjection'> {}

export interface GeopackageMeshSourceConfig
    extends DatasetSourceConfigBase<'geopackage'>,
        Omit<GeopackageSourceParameters, 'featureProjection'> {}

export interface ShapefileMeshSourceConfig
    extends DatasetSourceConfigBase<'shapefile'>,
        Omit<ShapefileSourceParameters, 'featureProjection'> {}

export type VectorMeshDatasetSourceConfig =
    | GpxMeshSourceConfig
    | KmlMeshSourceConfig
    | GeoJsonMeshSourceConfig
    | GeopackageMeshSourceConfig
    | ShapefileMeshSourceConfig
    | OlMeshSourceConfig;

export interface VectorMeshDatasetConfig extends DatasetConfigBase<'vector'> {
    source: VectorMeshDatasetSourceConfig | VectorMeshDatasetSourceConfig[];
    rendering?: 'mesh';
}

export interface VectorShapeDatasetConfig extends DatasetConfigBase<'vector'> {
    source: VectorMeshDatasetSourceConfig;
    rendering: 'shape';
}

export interface VectorLabelsDatasetConfig extends DatasetConfigBase<'vector'>, VectorLabelOptions {
    source: VectorMeshDatasetSourceConfig | VectorMeshDatasetSourceConfig[];
    rendering: 'label';
}

export type VectorDatasetConfig =
    | VectorMeshDatasetConfig
    | VectorShapeDatasetConfig
    | VectorLabelsDatasetConfig;

export type VectorDatasetRendering = NonNullable<VectorDatasetConfig['rendering']>;
