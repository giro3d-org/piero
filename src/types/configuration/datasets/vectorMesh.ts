import { VectorMeshSourceOptions } from '@/giro3d/entities/VectorMeshEntity';
import { DatasetConfigBase, DatasetSourceConfigBase } from './core/baseConfig';
import { GeopackageSourceParameters } from '@/giro3d/sources/GeopackageSource';
import { ShapefileSourceParameters } from '@/giro3d/sources/ShapefileSource';

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
    | ShapefileMeshSourceConfig;

export interface VectorMeshDatasetConfig extends DatasetConfigBase<'vectorMesh'> {
    source: VectorMeshDatasetSourceConfig | VectorMeshDatasetSourceConfig[];
}

export interface VectorShapeDatasetConfig extends DatasetConfigBase<'vectorShape'> {
    source: VectorMeshDatasetSourceConfig;
}
