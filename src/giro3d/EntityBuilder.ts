import type Instance from '@giro3d/giro3d/core/Instance';
import type Entity3D from '@giro3d/giro3d/entities/Entity3D';
import PotreePointCloud from '@giro3d/giro3d/entities/PotreePointCloud';
import PotreeSource from '@giro3d/giro3d/sources/PotreeSource';

import type { BuildingsDatasetConfig } from '@/types/configuration/datasets/buildings';
import type { DatasetAsMeshConfig } from '@/types/configuration/datasets';
import type { Dataset, DatasetBase } from '@/types/Dataset';
import { BuildingsEntity } from './entities/BuildingsEntity';
import type { CityJSONDatasetConfig } from '@/types/configuration/datasets/cityjson';
import CityJSONEntity from './entities/CityJSONEntity';
import type {
    VectorDatasetConfig,
    VectorLabelsDatasetConfig,
} from '@/types/configuration/datasets/vector';
import VectorMeshEntity, {
    GeoJsonMeshSource,
    GpxMeshSource,
    KmlMeshSource,
    OlMeshSource,
    type VectorMeshSource,
} from './entities/VectorMeshEntity';
import GeopackageSource from './sources/GeopackageSource';
import ShapefileSource from './sources/ShapefileSource';
import type { BuildingDatasetConfig } from '@/types/configuration/datasets/ifc';
import { getCoordinates } from '@/utils/Configuration';
import IfcEntity from './entities/IfcEntity';
import type { PointCloudDatasetConfig } from '@/types/configuration/datasets/pointCloud';
import PointCloudEntity, {
    CSVPointCloudSource,
    LASPointCloudSource,
    type PointCloudSource,
} from './entities/PointCloudEntity';
import type { PLYDatasetConfig } from '@/types/configuration/datasets/ply';
import PlyEntity from './entities/PlyEntity';
import type { TiledPointCloudDatasetConfig } from '@/types/configuration/datasets/tiledPointCloud';
import TiledPointCloudEntity from './entities/TiledPointCloudEntity';
import type { PotreePointCloudDatasetConfig } from '@/types/configuration/datasets/potreePointCloud';
import { fillObject3DUserData } from '@/loaders/userData';
import VectorShapeEntity from './entities/VectorShapeEntity';
import VectorLabelsEntity from './entities/VectorLabelsEntity';

/**
 * Gets the Giro3D entity for a dataset
 * @param instance - Giro3D main instance
 * @param dataset - Dataset
 * @returns Entity
 */
async function getEntity(
    instance: Instance,
    dataset: Dataset & DatasetBase<DatasetAsMeshConfig>,
): Promise<Entity3D> {
    let entity: Entity3D;

    switch (dataset.type) {
        case 'buildings': {
            const cfg = dataset.config as BuildingsDatasetConfig;
            entity = new BuildingsEntity({
                ...cfg,
                featureProjection: instance.referenceCrs,
            });
            break;
        }
        case 'cityjson': {
            const cfg = dataset.config as CityJSONDatasetConfig;
            entity = new CityJSONEntity({
                ...cfg.source,
                featureProjection: instance.referenceCrs,
            });
            break;
        }
        case 'vector': {
            const cfg = dataset.config as VectorDatasetConfig;
            const sourcesConfig = Array.isArray(cfg.source) ? cfg.source : [cfg.source];
            const sources: VectorMeshSource[] = [];
            const rendering = cfg.rendering ?? 'mesh';

            for (const sourceConfig of sourcesConfig) {
                switch (sourceConfig.type) {
                    case 'geojson':
                        sources.push(
                            new GeoJsonMeshSource({
                                ...sourceConfig,
                                featureProjection: instance.referenceCrs,
                            }),
                        );
                        break;
                    case 'gpx':
                        sources.push(
                            new GpxMeshSource({
                                ...sourceConfig,
                                featureProjection: instance.referenceCrs,
                            }),
                        );
                        break;
                    case 'kml':
                        sources.push(
                            new KmlMeshSource({
                                ...sourceConfig,
                                featureProjection: instance.referenceCrs,
                            }),
                        );
                        break;
                    case 'ol':
                        sources.push(
                            new OlMeshSource(sourceConfig.format, {
                                ...sourceConfig,
                                featureProjection: instance.referenceCrs,
                            }),
                        );
                        break;
                    case 'geopackage':
                        sources.push(
                            new GeopackageSource({
                                ...sourceConfig,
                                featureProjection: instance.referenceCrs,
                            }),
                        );
                        break;
                    case 'shapefile':
                        sources.push(
                            new ShapefileSource({
                                ...sourceConfig,
                                featureProjection: instance.referenceCrs,
                            }),
                        );
                        break;
                    default: {
                        // Exhaustiveness checking
                        const _exhaustiveCheck: never = sourceConfig;
                        return _exhaustiveCheck;
                    }
                }
            }

            switch (rendering) {
                case 'mesh':
                    entity = new VectorMeshEntity(sources);
                    break;
                case 'shape':
                    entity = new VectorShapeEntity(sources[0]);
                    break;
                case 'label':
                    entity = new VectorLabelsEntity(sources, cfg as VectorLabelsDatasetConfig);
                    break;
                default: {
                    // Exhaustiveness checking
                    const _exhaustiveCheck: never = rendering;
                    return _exhaustiveCheck;
                }
            }
            break;
        }
        case 'ifc': {
            const cfg = dataset.config as BuildingDatasetConfig;
            const at = getCoordinates(cfg.source.position ?? dataset.get('position'));
            entity = new IfcEntity({
                ...cfg.source,
                at,
                name: dataset.name,
            });
            break;
        }
        case 'flatPointcloud': {
            const cfg = dataset.config as PointCloudDatasetConfig;
            let source: PointCloudSource;
            switch (cfg.source.type) {
                case 'csv':
                    source = new CSVPointCloudSource({
                        ...cfg.source,
                        featureProjection: instance.referenceCrs,
                    });
                    break;
                case 'las':
                    source = new LASPointCloudSource({
                        ...cfg.source,
                        featureProjection: instance.referenceCrs,
                    });
                    break;
                default: {
                    // Exhaustiveness checking
                    const _exhaustiveCheck: never = cfg.source;
                    return _exhaustiveCheck;
                }
            }
            entity = new PointCloudEntity(source);
            break;
        }
        case 'ply': {
            const cfg = dataset.config as PLYDatasetConfig;
            const at = getCoordinates(cfg.source.position ?? dataset.get('position'));
            entity = new PlyEntity({
                ...cfg.source,
                at,
                featureProjection: instance.referenceCrs,
            });
            break;
        }
        case 'pointcloud': {
            const cfg = dataset.config as TiledPointCloudDatasetConfig;
            entity = new TiledPointCloudEntity({
                ...cfg.source,
                name: cfg.name,
            });
            break;
        }
        case 'potree': {
            const cfg = dataset.config as PotreePointCloudDatasetConfig;
            entity = new PotreePointCloud(new PotreeSource(cfg.source.url, cfg.source.filename));
            fillObject3DUserData(entity, {
                filename: cfg.source.url,
            });
            break;
        }
        default: {
            // Exhaustiveness checking
            const _exhaustiveCheck: never = dataset.type;
            return _exhaustiveCheck;
        }
    }

    if (!('dataset' in entity.object3d.userData)) entity.object3d.userData.dataset = {};
    entity.object3d.userData.dataset.name = dataset.name;

    return entity;
}

export default {
    getEntity,
};
