import type { UrlOrDataMixin } from '@/giro3d/sources/mixins';
import type { SourceConfigLocationMixin } from '@/types/configuration/sources/core/baseConfig';
import type { DatasetConfigBase, DatasetConfigMaskingMixin } from './core';

/** IFC source configuration */
export interface IFCDatasetSourceConfig extends UrlOrDataMixin, SourceConfigLocationMixin {}

/** IFC dataset configuration */
export interface IFCDatasetConfig extends DatasetConfigBase<'ifc'>, DatasetConfigMaskingMixin {
    source: IFCDatasetSourceConfig;
}
