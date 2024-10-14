import type { IfcSource } from '@/giro3d/entities/IfcEntity';
import type { SourceConfigLocationMixin } from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigBase, DatasetConfigMaskingMixin } from './core';

/** IFC source configuration */
export interface IFCDatasetSourceConfig
    extends Omit<IfcSource, 'at' | 'name'>,
        SourceConfigLocationMixin {}

/** IFC dataset configuration */
export interface IFCDatasetConfig extends DatasetConfigBase<'ifc'>, DatasetConfigMaskingMixin {
    source: IFCDatasetSourceConfig;
}
