import type { Tiles3dSource } from '@/giro3d/entities/Tiles3dEntity';

import type { DatasetConfigBase } from './core';

/** 3DTiles dataset configuration */
export interface TiledGeomDatasetConfig extends DatasetConfigBase<'tiledGeom'> {
    source: TiledGeomDatasetSourceConfig;
}

/** 3DTiles source configuration */
export interface TiledGeomDatasetSourceConfig extends Tiles3dSource {}
