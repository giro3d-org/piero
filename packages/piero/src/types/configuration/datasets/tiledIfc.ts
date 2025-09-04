import type { Tiles3dSource } from '@/giro3d/entities/Tiles3dEntity';
import type { DatasetConfigBase } from './core';

/** 3DTiles IFC source configuration */
export interface TiledIfcDatasetSourceConfig extends Tiles3dSource {}

/** 3DTiles IFC dataset configuration */
export interface TiledIfcDatasetConfig extends DatasetConfigBase<'tiledIfc'> {
    source: TiledIfcDatasetSourceConfig;
}
