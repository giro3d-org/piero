import type { DatasetConfigBase } from './core';
import type { TiledIfcSource } from '@/giro3d/entities/TiledIfcEntity';

/** 3DTiles IFC source configuration */
export interface TiledIfcDatasetSourceConfig extends TiledIfcSource {}

/** 3DTiles IFC dataset configuration */
export interface TiledIfcDatasetConfig extends DatasetConfigBase<'tiledIfc'> {
    source: TiledIfcDatasetSourceConfig;
}
