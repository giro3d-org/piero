import getConfig from '@/config-loader';
import type { TiledPointCloudDatasetConfig } from '@/types/configuration/datasets/tiledPointCloud';
import { getColorMap, getPublicFolderUrl } from '@/utils/Configuration';
import { MODE } from '@giro3d/giro3d/renderer/PointCloudMaterial';
import type { Builder } from '../EntityBuilder';
import type { Tiles3dSource } from './Tiles3dEntity';
import Tiles3dEntity from './Tiles3dEntity';

/** Parameters for creating {@link TiledPointCloudEntity} */
export interface TiledPointCloudSource extends Tiles3dSource {
    name: string;
}

/**
 * Entity for displaying 3D-Tiles point clouds
 */
export default class TiledPointCloudEntity extends Tiles3dEntity {
    constructor(parameters: TiledPointCloudSource) {
        const config = getConfig();
        super(parameters, {
            colorMap: getColorMap(config.pointcloud),
            pointCloudMode: MODE.ELEVATION,
        });
        this.name = `pointcloud-${parameters.name}`;
    }
}

export const build: Builder = context => {
    const { dataset } = context;

    const cfg = dataset.config as TiledPointCloudDatasetConfig;
    const entity = new TiledPointCloudEntity({
        ...cfg.source,
        url: getPublicFolderUrl(cfg.source.url),
        name: cfg.name,
    });

    return Promise.resolve(entity);
};
