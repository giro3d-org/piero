import type {
    SourceConfigLocationMixin,
    SourceConfigUrlOrDataMixin,
} from '@/types/configuration/sources/core/baseConfig';
import type { DatasetSourceConfigBase, DatasetConfigWithSourceBase } from './core/baseConfig';

/** IFC source configuration */
export interface IFCDatasetSourceConfig
    extends DatasetSourceConfigBase<'ifc'>,
        SourceConfigUrlOrDataMixin,
        SourceConfigLocationMixin {}

/** IFC dataset configuration */
export interface IFCDatasetConfig
    extends DatasetConfigWithSourceBase<'ifc', IFCDatasetSourceConfig> {}
