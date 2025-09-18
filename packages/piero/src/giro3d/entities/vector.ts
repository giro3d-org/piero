import type Entity3D from '@giro3d/giro3d/entities/Entity3D';

import type {
    VectorDatasetConfig,
    VectorLabelsDatasetConfig,
} from '@/types/configuration/datasets/vector';

import type { EntityBuilder } from '../EntityBuilder';
import type { VectorMeshSource, VectorMeshSourceOptions } from './VectorMeshEntity';

import GeopackageSource from '../sources/GeopackageSource';
import ShapefileSource from '../sources/ShapefileSource';
import VectorLabelsEntity from './VectorLabelsEntity';
import VectorMeshEntity, {
    GeoJsonMeshSource,
    GpxMeshSource,
    KmlMeshSource,
    OlMeshSource,
} from './VectorMeshEntity';
import VectorShapeEntity from './VectorShapeEntity';

export const build: EntityBuilder = context => {
    const { instance, dataset } = context;

    const cfg = dataset.config as VectorDatasetConfig;
    const sourcesConfig = Array.isArray(cfg.source) ? cfg.source : [cfg.source];
    const sources: VectorMeshSource[] = [];
    const rendering = cfg.rendering ?? 'mesh';

    let entity: Entity3D;

    for (const sourceConfig of sourcesConfig) {
        const commonOptions: VectorMeshSourceOptions = {
            url: sourceConfig.url,
            dataProjection: sourceConfig.dataProjection ?? dataset.get('dataProjection'),
            featureProjection: instance.referenceCrs,
            elevation: sourceConfig.elevation ?? dataset.get('elevation'),
            fetchElevation: sourceConfig.fetchElevation ?? dataset.get('fetchElevation'),
            fetchElevationFast:
                sourceConfig.fetchElevationFast ?? dataset.get('fetchElevationFast'),
            fetchElevationOffset:
                sourceConfig.fetchElevationOffset ?? dataset.get('fetchElevationOffset'),
            noDataValue: sourceConfig.noDataValue ?? dataset.get('noDataValue'),
        };

        switch (sourceConfig.type) {
            case 'geojson':
                sources.push(
                    new GeoJsonMeshSource({
                        ...commonOptions,
                    }),
                );
                break;
            case 'gpx':
                sources.push(
                    new GpxMeshSource({
                        ...commonOptions,
                    }),
                );
                break;
            case 'kml':
                sources.push(
                    new KmlMeshSource({
                        ...commonOptions,
                    }),
                );
                break;
            case 'ol':
                sources.push(
                    new OlMeshSource(sourceConfig.format, {
                        ...commonOptions,
                    }),
                );
                break;
            case 'geopackage':
                sources.push(
                    new GeopackageSource({
                        ...commonOptions,
                    }),
                );
                break;
            case 'shapefile':
                sources.push(
                    new ShapefileSource({
                        ...commonOptions,
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

    return Promise.resolve(entity);
};
