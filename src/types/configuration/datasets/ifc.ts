import type { SourceConfigLocationMixin } from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigBase } from './core/baseConfig';
import type { IfcSource } from '@/giro3d/entities/IfcEntity';

/** IFC source configuration */
export interface IFCDatasetSourceConfig
    extends Omit<IfcSource, 'at' | 'name'>,
        SourceConfigLocationMixin {}

/** IFC dataset configuration */
export interface BuildingDatasetConfig extends DatasetConfigBase<'ifc'> {
    source: IFCDatasetSourceConfig;
}
